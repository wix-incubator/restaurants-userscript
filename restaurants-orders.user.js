// ==UserScript==
// @name           Restaurants Orders
// @match http://*/*
// @version        1.10
// ==/UserScript==

var numIframesReplaced = 0;

function setLogMessage(text, color) {
	color = color || 'black';

	var prevStyle = document.querySelector('style[data-userscript-id=wix-restaurants]');
	if (prevStyle) {
		prevStyle.remove();
	}

	var style = document.createElement('style');
	style.setAttribute('data-userscript-id', 'wix-restaurants');
	style.type = 'text/css';
	style.appendChild(document.createTextNode(
		'body:before {' +
			'content: "' + text + '";' +
			'position: fixed;' +
			'top: 2px;' +
			'left: 2px;' +
			'font: bold 10px/1em menlo,monospace;' +
			'background: white;' +
			'color: ' + color + ';' +
			'z-index: 1000000;' +
			'padding: 7px;' +
		'}'
	));

	setTimeout(function () {
		style.appendChild(document.createTextNode(
			'body:before {' +
				'opacity: 0.4;' +
				'transition: opacity 1s ease-out 5s;' +
			'}'
		));
	}, 10);

	document.head.appendChild(style);
}

function updateLogMessage() {
	setLogMessage('WixRestaurants userscript v' + GM_info.script.version + ' (iframes: ' + numIframesReplaced + ')');
}

function onDOMSubtreeModified() {
	var iframe;
	[].slice.call(document.querySelectorAll('iframe'))
		.forEach(function (currentIframe) {
			if (currentIframe.src.indexOf('https://restaurants.wix.com') === 0) {
				iframe = currentIframe;
			}
		});

	if (iframe) {
		var host = localStorage.getItem('__restaurants_userscript.host');

		if (!host) {
			host = 'http://alpha.openrest.com';
			localStorage.setItem('__restaurants_userscript.host', host);
		}

		iframe.src = iframe.src.replace('https://restaurants.wix.com', host);

		numIframesReplaced++;

		console.log('%cWixRestaurants userscript updated iframe location',
			'background: #222; color: yellow; padding: 0px 3px');

		updateLogMessage();
		updateLogMessage();
	}
}

function addEventListener() {
	document.body.addEventListener('DOMSubtreeModified', onDOMSubtreeModified, false);
}

function init() {
	addEventListener();
	updateLogMessage();
}

if (location.hostname.match('.*wix\.com') ||
	document.querySelector('meta[http-equiv="X-Wix-Meta-Site-Id"]')) {
	init();
}
