"use strict";

function skipBrowser(object, properties) {
	for (let property of properties) {
		if (object[property] !== undefined) {
			return object[property];
		}
	}
	throw new Error('Browser does not have any: ' + properties.join(', or '));
}
window.fs = {
	isFullscreen: () => skipBrowser(document, ['fullscreen', 'webkitIsFullScreen', 'mozFullScreen']),
	requestFullscreen: _elem => skipBrowser(elem, ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen']).bind(elem)(),
	exitFullscreen: skipBrowser(document, ['exitFullscreen', 'webkitExitFullscreen', 'mozCancelFullScreen']).bind(document)
};