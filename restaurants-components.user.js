// ==UserScript==
// @name           Restaurants Components
// @match http://*/*
// @match https://*/*
// @version        1.0
// ==/UserScript==

function onDOMSubtreeModified() {
	var iframe;
	[].slice.call(document.querySelectorAll('iframe'))
		.forEach(function (currentIframe) {
			var src = currentIframe.src;
			if (src.indexOf('demoComponents') === -1 &&
                src.indexOf('wixrestaurants.com') !== -1 &&
				src.indexOf('type=backoffice') === -1) {
				iframe = currentIframe;
			}
		});

	if (iframe) {
        iframe.src = iframe.src + '&demoComponents=true';
	}
}

function addEventListener() {
	document.body.addEventListener('DOMSubtreeModified', onDOMSubtreeModified, false);
}

function init() {
	addEventListener();
}

if (location.hostname.match('.*wix\.com') ||
	document.querySelector('meta[http-equiv="X-Wix-Meta-Site-Id"]')) {
	init();
}
