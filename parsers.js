"use strict";

let parsers = [
	{
		name: "unknown",
		setup: () => {
			let definitions = [
				[/^[^\s]*/, "default"],
				[/^\s/,     "whitespace"]
			];
			return _input => {
				// lexer
				let tokens = [];
				while(_input.length) {
					for(let [regex, label] of definitions) {
						let matches = _input.match(regex);
						let match = matches && matches[0];
						if (match) {
							_input = _input.slice(match.length);
							tokens.push({value: match, label: label});
							break;
						}
					}
				}

				// parser
				let lines = [];
				let currentLine = [];
				lines.push(currentLine);
				for (let token of tokens) {
					if (token.value == "\n") {
						currentLine = [];
						lines.push(currentLine);
					} else {
						currentLine.push(token);
					}
				}
				return lines;
			};
		}
	},
	{
		name: "JavaScript",
		setup: () => {
			let keywords = new Set("abstract boolean break byte case catch char class let continue debugger default delete do double else enum export extends false final finally float for function goto if implements import in instanceof int interface let long native new null package private protected public return short static super switch synchronized this throw throws transient true try typeof var void volatile while with".split(" "));
			let declaratives = new Set("var let let class function".split(" "));
			let forwardslash = 47;
			let backslash = 92;
			let newline = 10;
			let doublequote = 34;
			let backtick = 96;
			let asterisk = 42;
			let digits = new Set([48,49,50,51,52,53,54,55,56,57]);
			let whitespace = new Set([32,9,10]);
			let puncuation = new Set([59,58,44,46]);
			let grouping = new Set([40,41,91,93,123,125]);
			let operator = new Set([43,45,42,47,37,61,38,94,124,60,62,126,33,63]);
			let string = new Set([34,39,96]);
			let number = new Set([46, ...Array.from(digits)]);
			let lowercase = new Set([97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122]);
			let uppercase = new Set([65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90]);
			let letters = new Set([...Array.from(lowercase), ...Array.from(uppercase)]);
			let possibleFirstIdentifierChars = new Set([95, 36, ...Array.from(letters)]);
			let possibleIdentifierChars = new Set([95, 36, ...Array.from(letters), ...Array.from(digits)]);
			let multilineCommentEnd = [42, 47];
			let whitespaceString = "whitespace";
			let identifierString = "indentifier";
			let puncuationString = "puncuation";
			let groupingString = "grouping";
			let operatorString = "operator";
			let stringString = "string";
			let numberString = "number";
			let unrecognizedString = "unrecognized";
			let multilineCommentString = "multilineComment";
			return _input => {
				// lexer-parser combo-wombo
				let lines = [];
				let currentLine = [];
				lines.push(currentLine);
				let pC = new ParseContext(_input);
				while(pC.index < pC.length) {
					let char = pC.chars[pC.index];
					if (whitespace.has(char)) {
						if (char == newline) {
							currentLine = [];
							lines.push(currentLine);
							pC.index++;
						} else {
							currentLine.push({label: whitespaceString, value: _input.charAt(pC.index++)});
						}
					} else if (possibleFirstIdentifierChars.has(char)) {
						let start = pC.index++;
						pC.skipWhile(possibleIdentifierChars);
						currentLine.push({label: identifierString, value: _input.slice(start, pC.index)});
					} else if (puncuation.has(char)) {
						currentLine.push({label: puncuationString, value: _input.charAt(pC.index++)});
					} else if (grouping.has(char)) {
						currentLine.push({label: groupingString, value: _input.charAt(pC.index++)});
					} else if (operator.has(char)) {
						if (char == forwardslash && pC.chars[pC.index + 1] == forwardslash) {
							let start = pC.index;
							pC.skipTo(newline);
							currentLine.push({label: multilineCommentString, value: _input.slice(start, pC.index)});
						} else if (char == forwardslash && pC.chars[pC.index + 1] == asterisk) {
							let start = pC.index;
							pC.index += 2;
							pC.findNextSubstr(multilineCommentEnd);
							pC.index += 2;
							currentLine.push({label: multilineCommentString, value: _input.slice(start, pC.index)});
						} else {
							currentLine.push({label: operatorString, value: _input.charAt(pC.index++)});
						}
					} else if (number.has(char)) {
						let start = pC.index++;
						pC.skipWhile(number);
						currentLine.push({label: numberString, value: _input.slice(start, pC.index)});
					} else if (string.has(char)) {
						let start = pC.index++;
						if (char == backtick) {
							pC.skipToWithEscape(backtick, backslash);
						} else {
							pC.skipUntilWithEscape(new Set([char, newline]), backslash);
						}
						if (pC.chars[pC.index] == char) {
							pC.index++;
						}
						currentLine.push({label: stringString, value: _input.slice(start, pC.index)});
					} else {
						currentLine.push({label: unrecognizedString, value: _input.charAt(pC.index++)});
					}
				}
				return lines;

				// parser
				/*let lines = [];
				let currentLine = [];
				lines.push(currentLine);
				for (let n = 0; n < tokens.length; n++) {
					let token = tokens[n];
					if (token.value == "\n") {
						currentLine = [];
						lines.push(currentLine);
					} else {
						currentLine.push(token);
					}
				}
				return lines;*/
			};
		}
	},
	{
		name: "HTML",
		setup: () => {
			let tagnames = new Set("a address area article aside audio b base bdi bdo blockquote body br button canvas caption cite col colgroup data datalist dd del details dfn dialog div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i input ins kbd label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param picture pre progress q rb rp rt rtc ruby s samp script section select small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr".split(" "));
			let definitions = [
				[/^<!--[^]*?-->/,                  "multilineComment"],
				[/^(['"])(?:[^\1\n\\]|\\[^])*?\1/, "string"],
				[/^[a-zA-Z_]\w*/,                  "name"],
				[/^\s/,                            "whitespace"],
				[/^\d+(?:\.\d+)?/,                 "number"],
				[/^[=\-\/|<>!]/,                   "operator"],
				[/^[^]/,                           "unrecognized"]
			];
			return _input => {
				// lexer
				let tokens = [];
				while(_input.length) {
					for(let [regex, label] of definitions) {
						let matches = _input.match(regex);
						let match = matches && matches[0];
						if (match) {
							_input = _input.slice(match.length);
							tokens.push({value: match, label: label});
							break;
						}
					}
				}

				// parser
				let lines = [];
				let currentLine = [];
				lines.push(currentLine);
				for (let token of tokens) {
					if (token.value == "\n") {
						currentLine = [];
						lines.push(currentLine);
					} else {
						if (token.label == "name") {
							if (tagnames.has(token.value)) {
								token.label = "keyword";
							}
						}
						currentLine.push(token);
					}
				}
				return lines;
			};
		}
	},
];