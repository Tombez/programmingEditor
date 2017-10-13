"use strict";

class ParseContext {
	constructor(_text, _index = 0) {
		this.chars = new TextEncoder().encode(_text);
		this.length = _text.length;
		this.index = _index;
	}
	skip(_charCode) {
		while(this.index < this.length && this.chars[this.index] == _charCode) {
			this.index++;
		}
	}
	skipTo(_charCode) {
		while(this.index < this.length && this.chars[this.index] != _charCode) {
			this.index++;
		}
	}
	skipToWithEscape(_charCode, _escapeCharCode) {
		while(this.index < this.length) {
			const current = this.chars[this.index];
			if (current != _charCode) {
				this.index++;
			} else {
				break;
			}
			if (current == _escapeCharCode) {
				this.index++
			}
		}
	}
	skipUntilWithEscape(_charCodeSet, _escapeCharCode) {
		while(this.index < this.length) {
			const current = this.chars[this.index];
			if (!_charCodeSet.has(current)) {
				this.index++;
			} else {
				break;
			}
			if (current == _escapeCharCode) {
				this.index++
			}
		}
	}
	skipWhile(_charCodeSet) {
		while(this.index < this.length && _charCodeSet.has(this.chars[this.index])) {
			this.index++;
		}
	}
	skipUntil(_charCodeSet) {
		while(this.index < this.length && !_charCodeSet.has(this.chars[this.index])) {
			this.index++;
		}
	}
	findNextSubstr(_charCodeArray) {
		for(; this.index < this.length; this.index++) {
			let n = 0;
			for (; n < _charCodeArray.length; n++) {
				if (this.chars[this.index + n] != _charCodeArray[n]) {
					break;
				}
			}
			if (n == _charCodeArray.length) {
				break;
			}
		}
	}
}