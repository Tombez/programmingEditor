// Licensed under the GPLv3 license by Tom Burris
'use strict';

/*const colorMap = new Map([ // monokai
	["singlelineComment", "#75715e"],
	["multilineComment", "#75715e"],
	["string", "#e6db74"],
	["regex", "#e6db74"],
	["number", "#ae81ff"],
	["operator", "#f92672"],
	["grouping", "#ccc"],
	["functionDeclaration", "#a6e22e"],
	["declarative", "#66d9ef"],
	["keyword", "#f92672"],
	["name", "#fff"],
	["punctuation", "#fff"],
	["background", "#272822"]
]);*/
/*const colorMap = new Map([ // mynokai
	["singlelineComment", "#75715e"],
	["multilineComment", "#75715e"],
	["string", "#e6db74"],
	["regex", "#e6db74"],
	["number", "#ae81ff"],
	["operator", "#ff9800"],
	["functionDeclaration", "#a6e22e"],
	["declarative", "#66d9ef"],
	["keyword", "#f92672"],
	["default", "#fff"],
	["background", "#151718"]
]);*/
const colorMap = new Map([ // All Hallow's Eve
	["singlelineComment", "#9933cc"],
	["multilineComment", "#9933cc"],
	["string", "#66cc33"],
	["regex", "#66cc33"],
	["number", "#3387cc"],
	["operator", "#cc7833"],
	["functionDeclaration", "#c83730"],
	["declarative", "#cc7833"],
	["keyword", "#cc7833"],
	["default", "#fff"],
	["background", "#000"]
]);
const keywords = new Set("abstract boolean break byte case catch char class const continue debugger default delete do double else enum export extends false final finally float for function goto if implements import in instanceof int interface let long native new null package private protected public return short static super switch synchronized this throw throws transient true try typeof var void volatile while with".split(" "));
const declaratives = new Set("var let const class function".split(" "));
const definitions = [
	[/^\/\/[^\n]*/,                   "singlelineComment"],
	[/^\/\*[\S\s]*?\*\//,             "multilineComment"],
	[/^(['"`])(?:[^\1\\]|\\[^])*?\1/, "string"],
	[/^\/(?:[^\s\/\\]|\\[^])*?\//,    "regex"],
	[/^[a-zA-Z_]\w*/,                 "name"],
	[/^\s/,                           "whitespace"],
	[/^\d+(?:\.\d+)?/,                "number"],
	[/^[()[{\]}]/,                    "grouping"],
	[/^[+\-*\/%=&^|<>~]/,             "operator"],
	[/^[!;:,.?]/,                     "punctuation"],
	[/^[^]/,                          "unrecognized"]
];
function lexer(_input) {
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
	return tokens;
}
function parser(_tokens) {
	let lines = [];
	let currentLine = [];
	lines.push(currentLine);
	for (let n = 0; n < _tokens.length; n++) {
		let token = _tokens[n];
		if (token.value == "\n") {
			currentLine = [];
			lines.push(currentLine);
		} else {
			if (token.label == "name") {
				if (declaratives.has(token.value)) {
					token.label = "declarative";
					if (token.value == "function") {
						forLabel:
						for (let i = n; ++i < _tokens.length;) {
							let nextToken = _tokens[i];
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
}
let editor;
document.addEventListener("DOMContentLoaded", function() {
	editor = new Editor(Editor.toString(), lexer, parser, colorMap);
	editor.container.id = "container";
	editor.canvas.id = "textarea";
	document.body.appendChild(editor.container);
	editor.resize();

	//let font = new FontFace("Ubuntu Mono", "url(https://fonts.gstatic.com/s/ubuntumono/v6/ViZhet7Ak-LRXZMXzuAfkY4P5ICox8Kq3LLUNMylGO4.woff2)");
	let font = new FontFace("Inconsolata", "url(./Inconsolata/Inconsolata-Regular.ttf)");
	document.fonts.add(font);
	font.load().then(function() {
		editor.fontFamily = font.family;
		editor.draw();
	}).catch(function() {
		editor.fontFamily = "monospace";
		editor.draw();
	});
});