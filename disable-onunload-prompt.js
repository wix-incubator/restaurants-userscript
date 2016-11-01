// ==UserScript==
// @name        Wix Editor  Reload Prompt Disabler
// @version      0.1
// @author       Wix Restaurants
// @match        http://editor.wix.com/*
// ==/UserScript==

function checkForEvent() {
    if (window.onbeforeunload) {
        window.onbeforeunload = function () {};
    } else {
        setTimeout(checkForEvent, 200);
    }
}

(function () {
    checkForEvent();
})();
