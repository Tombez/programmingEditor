// Licensed under the GPLv3 license by Tom Burris
"use strict";

const parsers = [
	{
		name: "JavaScript",
		setup: function() {
			const keywords = new Set("abstract boolean break byte case catch char class const continue debugger default delete do double else enum export extends false final finally float for function goto if implements import in instanceof int interface let long native new null package private protected public return short static super switch synchronized this throw throws transient true try typeof var void volatile while with".split(" "));
			const declaratives = new Set("var let const class function".split(" "));
			const definitions = [
				[/^\/\/[^\n]*/,                   "singlelineComment"],
				[/^\/\*[\S\s]*?\*\//,             "multilineComment"],
				[/^(['"])(?:[^\1\n\\]|\\[^])*\1/, "string"],
				[/^\/(?:[^\s\/\\]|\\[^])*\//,     "regex"],
				[/^[a-zA-Z_]\w*/,                 "name"],
				[/^\s/,                           "whitespace"],
				[/^\d+(?:\.\d+)?/,                "number"],
				[/^[()[{\]}]/,                    "grouping"],
				[/^[+\-*\/%=&^|<>~!?]/,           "operator"],
				[/^[;:,.]/,                       "punctuation"],
				[/^[^]/,                          "unrecognized"]
			];
			return function(_input) {
				let tokens = [];
				while(_input.length) {
					for(let definition of definitions) {
						let matches = _input.match(definition[0]);
						let match = matches && matches[0];
						if (match) {
							_input = _input.slice(match.length);
							tokens.push({value: match, label: definition[1]});
							break;
						}
					}
				}
				let lines = [];
				let currentLine = [];
				lines.push(currentLine);
				for (let n = 0; n < tokens.length; n++) {
					let token = tokens[n];
					if (token.value == "\n") {
						currentLine = [];
						lines.push(currentLine);
					} else {
						if (token.label == "name") {
							if (declaratives.has(token.value)) {
								token.label = "declarative";
								if (token.value == "function") {
									forLabel:
									for (let i = n; ++i < tokens.length;) {
										let nextToken = tokens[i];
										switch(nextToken.label) {
											case "whitespace":
												break;
											case "name":
												nextToken.label = "functionDeclaration";
											default:
												break forLabel;
										}
									}
								}
							} else if (keywords.has(token.value)) {
								token.label = "keyword";
							}
						}
						currentLine.push(token);
					}
				}
				return lines;
			};
		}
	}
];