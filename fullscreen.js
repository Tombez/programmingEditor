"use strict";

function skipBrowser(object, properties) {
	for (let property of properties)
		if (object[property] !== undefined)
			return object[property];
	throw new Error('Browser does not have any: ' + properties.join(', or '));
}
const isFsNames = ['fullscreen', 'webkitIsFullScreen', 'mozFullScreen'];
const reqFsNames = ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen'];
const exitFsNames = ['exitFullscreen', 'webkitExitFullscreen', 'mozCancelFullScreen'];
window.fs = {
	isFullscreen: () => skipBrowser(document, isFsNames),
	requestFullscreen: elem => skipBrowser(elem, reqFsNames).bind(elem)(),
	exitFullscreen: skipBrowser(document, exitFsNames).bind(document)
};
