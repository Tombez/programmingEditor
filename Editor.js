"use strict";

class Editor {
	constructor(_parser, _colorMap, _text = "") {
		this.parser = _parser;
		this.colorMap = _colorMap;
		this.text = _text;
		this.init();
		this.build();
		this.attachListeners();
		this.update();
	}
	init() {
		this.fontSize = 16;
		this.tabSize = 4;
		this.padding = 10;
		this.scrollBarSize = 1;
		this.selection = {
			begin: new TextPosition(this.tabSize),
			end: new TextPosition(this.tabSize)
		};
		this.fontFamily = "monospace";
		this.scrollTop = 0;
		this.col = 0;
		this.focused = false;
		this.pasteExpected = false;
		this.dragging = false;
		this.mousePos = {x: 0, y: 0};
	}
	build() {
		this.container = document.createElement("div");
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("tabindex", 0);
		this.container.appendChild(this.canvas);
		this.copyInput = document.createElement("textarea");
		this.copyInput.style.position = "fixed";
		this.copyInput.style.top = "-500px";
		this.container.appendChild(this.copyInput);
		this.downloadLink = document.createElement("a");
		this.container.appendChild(this.downloadLink);
	}
	attachListeners() {
		for (let eventType of "mousedown keydown keyup mousemove focus blur".split(" ")) {
			this.canvas.addEventListener(eventType, this[eventType].bind(this));
		}
		this.canvas.addEventListener("wheel", this.wheel.bind(this), {passive: true});
		for (let eventType of "resize mouseup paste".split(" ")) {
			window.addEventListener(eventType, this[eventType].bind(this));
		}
	}
	update() {
		//console.log("update");
		//let start = performance.now();
		//for (let n = 0; n < 1000; n++) {
			this.lines = this.parser(this.text);
		//}
		//console.log(performance.now() - start);
		this.draw();
	}
	draw() {
		//console.log("draw");
		let ctx = this.canvas.getContext("2d");
		const defaultColor = this.colorMap.get("default");

		// background
		ctx.fillStyle = this.colorMap.get("background");
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// tokens
		ctx.beginPath();
		ctx.font = this.fontSize + "px " + this.fontFamily + ", monospace";
		this.fontWidth = ctx.measureText("a").width;
		ctx.textBaseline = "top";
		const startX = Math.min(Math.ceil((this.scrollTop + this.canvas.height) / this.fontSize), this.lines.length).toString().length * this.fontWidth + this.padding;
		let x =  startX;
		let y = -(this.scrollTop % this.fontSize);
		for (let lineNum = (this.scrollTop / this.fontSize) | 0; lineNum < this.lines.length && y < this.canvas.height; lineNum++) {
			let line = this.lines[lineNum];
			ctx.globalAlpha = 0.7;
			ctx.fillStyle = defaultColor;
			const visualLineNum = (lineNum + 1).toString();
			ctx.fillText(visualLineNum, startX -this.padding - visualLineNum.length * this.fontWidth, y);
			ctx.globalAlpha = 1;
			for (let token of line) {
				switch (token.value) {
					case "\t":
						ctx.rect(x, y, 1, this.fontSize);
						x += this.tabSize * this.fontWidth;
						break;
					case " ":
						x += this.fontWidth;
						break;
					default:
						ctx.fillStyle = this.colorMap.get(token.label) || defaultColor;
						ctx.fillText(token.value, x, y);
						x += token.value.length * this.fontWidth;
						break;
				}
				if (x >= this.canvas.width) {
					break;
				}
			}
			y += this.fontSize;
			x = startX;
		}
		ctx.globalAlpha = 0.2;
		ctx.fillStyle = defaultColor;
		ctx.fill();
		ctx.globalAlpha = 1;

		// scroll bar
		const totalHeight = this.lines.length * this.fontSize;
		const ratio = this.canvas.height / totalHeight;
		const barHeight = Math.max((this.canvas.height * ratio) | 0, this.scrollBarSize);
		const barTop = ((this.scrollTop / (totalHeight - this.canvas.height)) * (this.canvas.height - barHeight)) | 0;
		ctx.fillStyle = defaultColor;
		ctx.fillRect(this.canvas.width - this.scrollBarSize, barTop, this.scrollBarSize, barHeight);

		ctx.strokeStyle = defaultColor;

		if (this.focused) {
			// caret
			ctx.fillStyle = defaultColor;
			ctx.fillRect(this.selection.end.col * this.fontWidth +  startX, this.selection.end.row * this.fontSize - this.scrollTop, 1, this.fontSize);

			//selection
			let begin = this.selection.begin.index < this.selection.end.index ? this.selection.begin : this.selection.end;
			let end = this.selection.begin.index < this.selection.end.index ? this.selection.end : this.selection.begin;
			let x = begin.col * this.fontWidth;
			if (begin.row == end.row) {
				ctx.rect(startX + x, begin.row * this.fontSize - this.scrollTop, end.col * this.fontWidth - x, this.fontSize);
			} else {
				let lineStart = this.text.indexOf("\n", begin.index) + 1;
				let line = this.text.slice(begin.index, lineStart);
				ctx.rect(startX + x, begin.row * this.fontSize - this.scrollTop, (line.length + (line.match(/\t/g) || []).length * (this.tabSize - 1)) * this.fontWidth, this.fontSize);
				for (let n = begin.row + 1; n < end.row; n++) {
					let y = n * this.fontSize;
					if (y > this.scrollTop && y < this.scrollTop + this.canvas.height) {
						line = this.text.slice(lineStart, (lineStart = this.text.indexOf("\n", lineStart) + 1));
						ctx.rect(startX, y - this.scrollTop, (line.length + (line.match(/\t/g) || []).length * (this.tabSize - 1)) * this.fontWidth, this.fontSize);
					}
				}
				ctx.rect(startX, end.row * this.fontSize - this.scrollTop, end.col * this.fontWidth, this.fontSize);
			}
			ctx.globalAlpha = 0.2;
			ctx.fillStyle = defaultColor;
			ctx.fill();
			ctx.globalAlpha = 1;

			// active line
			let visualLineNum = (this.selection.end.row + 1).toString();
			ctx.fillStyle = defaultColor;
			ctx.fillText(visualLineNum, startX -this.padding - visualLineNum.length * this.fontWidth, this.selection.end.row * this.fontSize - this.scrollTop);
		}
	}
	type(_text) {
		//console.log("type");
		let begin = this.selection.begin.index < this.selection.end.index ? this.selection.begin : this.selection.end;
		let end = this.selection.begin.index < this.selection.end.index ? this.selection.end : this.selection.begin;
		this.text = this.text.slice(0, begin.index) + _text + this.text.slice(end.index, this.text.length);
		begin.setIndex(begin.index + _text.length, this.text);
		end.setIndex(begin.index, this.text);
		this.update();
	}
	getSelection() {
		return this.text.slice(Math.min(this.selection.begin.index, this.selection.end.index), Math.max(this.selection.begin.index, this.selection.end.index));
	}
	changeSelection(_x, _y, _selection) {
		//console.log("mousechange");
		let startX = ((((this.scrollTop + this.canvas.height) / this.fontSize) | 0) + 1).toString().length * this.fontWidth + this.padding;
		let row = ((_y + this.scrollTop) / this.fontSize) | 0;
		let col = ((_x -  startX) / this.fontWidth + 0.5) | 0;
		this.col = col;
		_selection.setRowCol(row, col, this.text);
		this.draw();
	}
	mousedown(_event) {
		//console.log("mousedown");
		switch(_event.detail) {
			case 1:
				this.changeSelection(_event.offsetX, _event.offsetY, this.selection.begin);
				this.changeSelection(_event.offsetX, _event.offsetY, this.selection.end);
				this.dragging = true;
				this.dragLoop();
				break;
			case 2:

				break;
			case 3:
				
				break;
		}
	}
	mouseup(_event) {
		//console.log("mouseup");
		this.dragging = false;
	}
	mousemove(_event) {
		this.mousePos.x = _event.offsetX;
		this.mousePos.y = _event.offsetY;
	}
	dragLoop() {
		this.changeSelection(this.mousePos.x, this.mousePos.y, this.selection.end);
		this.draw();
		this.dragging && requestAnimationFrame(this.dragLoop.bind(this));
	}
	keydown(_event) {
		//console.log("keydown");
		let prevent = true;
		if (_event.ctrlKey) {
			switch(_event.key) {
				case "j": // test
					for (let n = 0; n < 1E3; n++) {
						this.update();
					}
					break;
				case "c": // copy
					this.copyInput.value = this.getSelection();
					this.copyInput.select();
					document.execCommand("copy");
					this.canvas.focus();
					break;
				case "x": // cut
					// copy
					this.copyInput.value = this.getSelection();
					this.copyInput.select();
					document.execCommand("copy");
					this.canvas.focus();
					// delete
					this.type("");
					break;
				case "v":
					this.pasteExpected = true;
					prevent = false;
					break;
				case "a": // selects entire file
					this.selection.begin.setIndex(0, this.text);
					this.selection.end.setIndex(this.text.length, this.text);
					this.draw();
					break;
				case "s": // save
					let filename = prompt("What name and extension would you like to save this file under?");
					if (filename) {
						this.downloadLink.href = URL.createObjectURL(new Blob([this.text], {type:"text/plain"}));
						this.downloadLink.download = filename;
						this.downloadLink.click();
						URL.revokeObjectURL(this.downloadLink.href);
					}
					break;
				case "z": // undo
					console.log("undo");
					break;
				case "y": // redo
					console.log("redo");
					break;
				case "Home": // move cursor to beginning of file
					this.selection.end.setIndex(0, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setIndex(0, this.text);
					}
					this.draw();
					break;
				case "End": // move cursor to end of file
					this.selection.end.setIndex(this.text.length, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setIndex(this.text.length, this.text);
					}
					this.draw();
					break;
				default:
					prevent = false;
					break;
			}
		} else if (_event.altKey) {

		} else {
			switch(_event.key) {
				case "Tab": // types a tab, or indents multiple lines

					let text = this.getSelection();
					if (/\n/.test(text)) {
						if (_event.shiftKey) {
							this.type(text.replace(/^\t/gm, ""));
						} else {
							this.type(text.replace(/^/gm, "\t"));
						}
					} else {
						this.type("\t");
					}
					break;
				case "Backspace": // deletes selection or previous character
					if (this.selection.begin.index == this.selection.end.index) {
						this.selection.begin.index = Math.max(this.selection.begin.index - 1, 0);
					}
					this.type("");
					break;
				case "F11": // toggles fullscreen
					if (window.fs.isFullscreen()) {
						window.fs.exitFullscreen();
					} else { 
						window.fs.requestFullscreen(this.container);
					}
					break;
				case "ArrowLeft": // moves selection
					this.selection.end.setIndex(this.selection.end.index - 1, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setIndex(this.selection.end.index, this.text);
					}
					this.col = this.selection.end.col;
					this.draw();
					break;
				case "ArrowUp":
					this.selection.end.setRowCol(this.selection.end.row - 1, this.col, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setRowCol(this.selection.end.row, this.col, this.text);
					}
					this.draw();
					break;
				case "ArrowRight":
					this.selection.end.setIndex(this.selection.end.index + 1, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setIndex(this.selection.end.index, this.text);
					}
					this.col = this.selection.end.col;
					this.draw();
					break;
				case "ArrowDown":
					this.selection.end.setRowCol(this.selection.end.row + 1, this.col, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setRowCol(this.selection.end.row, this.col, this.text);
					}
					this.draw();
					break;
				case "Home": // moves cursor to beginning of line
					const lastTab = this.text.lastIndexOf("\t", this.selection.end.index);
					const lastNewline = this.text.lastIndexOf("\n", this.selection.end.index - 1);
					this.selection.end.setIndex(Math.max(lastTab, lastNewline) + 1, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setIndex(this.selection.end.index, this.text);
					}
					this.draw();
					break;
				case "End": // moves cursor to end of line
					const nextNewline = this.text.indexOf("\n", this.selection.end.index);
					this.selection.end.setIndex(nextNewline == -1 ? this.text.length : nextNewline, this.text);
					if (!_event.shiftKey) {
						this.selection.begin.setIndex(this.selection.end.index, this.text);
					}
					this.draw();
					break;
				case "PageUp": // scrolls the editor

					break;
				case "PageDown":

					break;
				case "Enter":
					this.type("\n")
					break;
				default:
					if (_event.key.length == 1) {
						this.type(_event.key);
					} else {
						prevent = false;
					}
					break;
			}
		}
		prevent && _event.preventDefault();
	}
	keyup(_event) {
		//console.log("keyup");
	}
	paste(_event) {
		//console.log("paste");
		if (this.pasteExpected && _event.clipboardData.types.length && /text/.test(_event.clipboardData.types[0])) {
			this.type(_event.clipboardData.getData("text/plain"));
			_event.preventDefault();
			this.pasteExpected = false;
		}
	}
	wheel(_event) {
		//console.log("wheel", _event);
		let newScrollTop = Math.max(Math.min(this.scrollTop + (_event.deltaY > 0 ? 50 : -50), this.lines.length * this.fontSize - this.canvas.height), 0);
		if (this.scrollTop != newScrollTop) {
			this.scrollTop = newScrollTop;
			this.draw();
		}
	}
	resize() {
		//console.log("resize");
		this.canvas.width = this.container.offsetWidth | 0;
		this.canvas.height = this.container.offsetHeight | 0;
		this.draw();
	}
	focus(_event) {
		//console.log("focus");
		this.focused = true;
		this.draw();
	}
	blur(_event) {
		//console.log("blur");
		this.focused = false;
		this.draw();
	}
}

class TextPosition { // I hate this class's methods. This implementation isn't elegant at all. :(
	constructor(_tabSize) {
		this.tabSize = _tabSize;
		this.index = 0;
		this.row = 0;
		this.col = 0;
		this.char = 0;
	}
	setIndex(_index, _text) {
		this.index = Math.max(Math.min(_index, _text.length), 0);
		let fromStartToIndex = _text.slice(0, this.index);
		this.row = (fromStartToIndex.match(/\n/g) || []).length;
		let fromLastNewlineToEnd = fromStartToIndex.slice((/\n/.test(fromStartToIndex) ? fromStartToIndex.lastIndexOf("\n") + 1 : 0));
		this.char = _text.length - fromLastNewlineToEnd.length;
		this.col = fromLastNewlineToEnd.length + (fromLastNewlineToEnd.match(/\t/g) || []).length * (this.tabSize - 1);
	}
	setRowCol(_row, _col, _text) {
		let lines = _text.split("\n");
		this.row = Math.max(Math.min(_row, lines.length - 1), 0);
		let line = lines[this.row];
		let tabs = (line.match(/\t/g) || []).length; // this could cause buggy behavior if there are tabs in the middle of lines, but who would do that, right?
		_col = Math.min(_col, line.length  + tabs * (this.tabSize - 1));
		if (tabs * this.tabSize <= _col) {
			this.col = _col;
			this.char = _col - tabs * (this.tabSize - 1);
		} else {
			this.char = (_col / this.tabSize + 0.5) | 0;
			this.col = this.char * this.tabSize;
		}
		this.index = 0;
		let n;
		for(n = 0; n < this.row; n++) {
			this.index += lines[n].length;
		}
		this.index += this.char + n;
	}
}