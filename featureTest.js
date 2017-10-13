if (navigator.appName == "Microsoft Internet Explorer" || /Trident/.test(navigator.userAgent) || /rv 11/.test(navigator.userAgent) || /Edge/.test(navigator.userAgent)) {
	document.execCommand("Stop");
	window.location = "https://www.google.com/chrome/browser/desktop/";
}