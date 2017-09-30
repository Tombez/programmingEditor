"use strict";

function skipBrowserInconsistencies(object, properties) {
	for (let property of properties) {
		if (object[property] !== undefined) {
			return object[property];
		}
	}
	throw new Error('Browser does not have any: ' + properties.join(', or '));
}
window.fs = {
	fullscreen: function() {
		return skipBrowserInconsistencies(document, ['fullscreen', 'webkitIsFullScreen', 'mozFullScreen']);
	},
	requestFullscreen: function(elem) {
		return skipBrowserInconsistencies(elem, ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen']).bind(elem)();
	},
	exitFullscreen: skipBrowserInconsistencies(document, ['exitFullscreen', 'webkitExitFullscreen', 'mozCancelFullScreen']).bind(document)()
};