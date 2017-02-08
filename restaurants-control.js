// ==UserScript==
// @version      1.0.0
// @author       Wix Restaurants
// @description  Enables i18n debug mode where tokens are visible.
// @name         Wix Restaurants Control
// @match        http://alpha.wixrestaurants.com/*
// @match        https://apps.wixrestaurants.com/*
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    let shown = false;

    const initialValue = GM_getValue('filtervalue');
    if (initialValue) {
        unsafeWindow.blackListedRegexes.push(new RegExp(initialValue));
    }

    function show() {
        shown = true;

        $('#___updatefileters___').detach();
        const toolbar = $('<div>', {id:'___updatefileters___'}).css({position: 'fixed', top: '0px', padding: '12px 0px', zIndex: '10000', width: '100%', boxShadow: '1px 0px 11px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', flexDirection:'column'});
        toolbar.insertBefore($('.mainDiv'));

        const restaurantId = unsafeWindow.full.restaurant.id;
        const metasiteId = unsafeWindow.WixInstance.getMetasiteIdCalculate();

        const boldFontFamily = ["HelveticaNeueW01-55Roma", "HelveticaNeueW02-55Roma", "HelveticaNeueW10-55Roma"].join(',');
        const lightFontFamilly = ["HelveticaNeueW01-45Ligh", "HelveticaNeueW02-45Ligh", "HelveticaNeueW10-45Ligh"].join(',');

        $('<div>').css({}).text('Generic Data:').css({fontFamily: boldFontFamily, width:'80%'}).appendTo(toolbar);

        const data = $('<div>').css({width:'80%', display:'flex', justifyContent: 'space-between', paddingBottom: '12px'}).appendTo(toolbar);

        [{title:'Restaurant Id', value: restaurantId}, {title: 'Metasite Id', value: metasiteId}].forEach(v => {
            let set = $('<div>').css({fontFamily: lightFontFamilly}).appendTo(data);
            $('<span>').text(v.title+': ').appendTo(set);
            $('<span>').text(v.value).css({textDecoration:'underline', cursor: 'pointer'}).appendTo(set).on('click', () => {
                GM_setClipboard(v.value, 'text');
                alert('Copied to clipboard');
            });
        });

        $('<div>').css({}).text('Console Filter:').css({fontFamily: boldFontFamily, width:'80%'}).appendTo(toolbar);

        const input = $('<input>').css({width:'80%', height: '36px', lineHeight:'36px', border: '1px solid #c1e4fe', backgroundColor: '#ffffff', color: '#162d3d', padding: '0px 12px'}).attr({placeholder:'Enter actions to filter (regex)...'});
        input.appendTo(toolbar);

        input.val(GM_getValue('filtervalue'));

        input.on('change', (e) => {
            unsafeWindow.blackListedRegexes.splice(0, unsafeWindow.blackListedRegexes.length);
            unsafeWindow.blackListedRegexes.push(new RegExp(e.target.value));
            GM_setValue('filtervalue', e.target.value);
        });

        $('<div>').text('Close').appendTo(toolbar).css({textDecoration:'underline', cursor: 'pointer', marginTop: '12px'}).on('click', () => {
            hide();
        });
    }

    function hide() {
        shown = false;
        $('#___updatefileters___').detach();
    }

    GM_registerMenuCommand('Update Filters', () => {
        show();
    }, 'R');

    $(unsafeWindow.document.body).on('keypress', (e) => {
        if ((e.charCode === 174) && (e.altKey)) {
            if (shown) { hide(); } else { show(); }
        }
    });
})();
