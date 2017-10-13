"use strict";

const colorSchemes = [
	{
		name: "unknown",
		map: new Map([
			["default", "#fff"],
			["background", "#000"]
		])
	},
	{
		name: "Monokai",
		map: new Map([
			["singlelineComment", "#75715e"],
			["multilineComment", "#75715e"],
			["string", "#e6db74"],
			["regex", "#e6db74"],
			["number", "#ae81ff"],
			["operator", "#f92672"],
			["functionDeclaration", "#a6e22e"],
			["declarative", "#66d9ef"],
			["keyword", "#f92672"],
			["default", "#fff"],
			["background", "#272822"]
		])
	},
	{
		name: "Mynokai",
		map: new Map([
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
		])
	},
	{
		name: "All Hallow's Eve",
		map: new Map([
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
			["background", "#000"],
			["unrecognized", "#e91e63"]
		])
	},
	{
		name: "MDN",
		map: new Map([
			["singlelineComment", "#708090"],
			["multilineComment", "#708090"],
			["string", "#669900"],
			["regex", "#66cc33"],
			["number", "#905"],
			["operator", "#a67f59"],
			["declarative", "#0077aa"],
			["grouping", "#999"],
			["punctuation", "#999"],
			["keyword", "#0077aa"],
			["default", "#333"],
			["background", "#eee"],
			["unrecognized", "#e91e63"]
		])
	}
];