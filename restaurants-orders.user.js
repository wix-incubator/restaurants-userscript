// ==UserScript==
// @name           Restaurants Orders
// @match http://*/*
// @match https://*/*
// @version        1.17
// ==/UserScript==

var numIframesReplaced = 0,
	betaValue;

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
			'pointer-events: none;' +
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
	var message = 'WixRestaurants userscript v' + GM_info.script.version + ' (';

	message += 'iframes: ' + numIframesReplaced;

	if (betaValue !== undefined) {
		message += ', beta: ' + betaValue;
	}

	message += ')';

	setLogMessage(message);
}

function onDOMSubtreeModified() {
	var iframe;
	[].slice.call(document.querySelectorAll('iframe'))
		.forEach(function (currentIframe) {
			var src = currentIframe.src;
			if (src.indexOf('https://apps.wixrestaurants.com') === 0 &&
				src.indexOf('type=backoffice') === -1) {
				iframe = currentIframe;
			}
		});

	if (iframe) {
		var host = localStorage.getItem('__restaurants_userscript.host');

		// migrating older script verstion, TODO - remove in Febuary
		if (!host || host === 'http://alpha.openrest.com') {
			host = location.protocol + '//alpha.wixrestaurants.com';

			// Had to place this in a try..catch since Safari started throwing
			// `QuotaExceededError: DOM Exception 22` errors.
			//
			try {
				localStorage.setItem('__restaurants_userscript.host', host);
			} catch (err) { }
		}

		iframe.src = iframe.src.replace('https://apps.wixrestaurants.com', host);

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

function determineBetaValue() {
	let iframe = document.createElement('iframe');
	iframe.style.opacity = '0';
	iframe.style.pointerEvents = 'none';
	iframe.style.position = 'fixed';
	iframe.style.width = '1px';
	iframe.style.height = '1px';
	iframe.style.left = '-10px';
	iframe.style.top = '-10px';
	iframe.src = location.protocol + '//apps.wixrestaurants.com/beta';
	document.body.appendChild(iframe);

	setTimeout(function () {
		window.addEventListener('message', function (e) {
			try {
				let data = JSON.parse(e.data);
				if (data.cmd === 'getValueResponse') {
					betaValue = data.params;
					updateLogMessage();
				}
			} catch (err) {}
		});

		iframe.contentWindow.postMessage(JSON.stringify({cmd: 'getValue'}), '*');
	}, 1000);
}

function init() {
	addEventListener();
	updateLogMessage();
	determineBetaValue();
}

if (location.hostname.match('.*wix\.com') ||
	document.querySelector('meta[http-equiv="X-Wix-Meta-Site-Id"]')) {
	init();
}
