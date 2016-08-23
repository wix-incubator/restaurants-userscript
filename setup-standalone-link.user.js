// ==UserScript==
// @name         Setup Standalone Link
// @match        http://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    const request = (params) => {
        return fetch('https://api.openrest.com/v1.1', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }).then(r => r.json()).then((res) => {
            if (res.error) {
                return Promise.reject(new Error(JSON.stringify(res)));
            }
            return res;
        });
    };

    function authenticate() {

        const appId = unsafeWindow.window.WixInstance.getAppId();
        const instance = unsafeWindow.WixInstance.getInstance();

        return fetch('https://auth.openrest.com/v1.0', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({type:'wix.loginInstance', instance, appKey:appId})
        }).then(r => r.json()).then(res => {
            return res.value;
        });
    }

    // TODO: Only on orders! and only editor
    if ((unsafeWindow.full) && (unsafeWindow.full.restaurant) && (unsafeWindow.full.restaurant.id) && (unsafeWindow.Wix)) {
        const {locale, title, id} = unsafeWindow.full.restaurant;

        let componentInfo = null;
        unsafeWindow.Wix.getComponentInfo(function(e) {
            componentInfo = e;
        });

        let accessToken = null;
        authenticate().then(res => accessToken = res.accessToken);

        const button = $("<div style='position:fixed;z-index:10000000;top:0px;left:0px;width:20px;height:20px;background:green;text-align:center;line-height:20px;color:white;box-shadow:1px 1px 1px rgba(0,0,0,0.5);cursor:pointer;border-radius:50%'>M</div>").appendTo($(unsafeWindow.body));
        button.on('click', () => {
            const alias = unsafeWindow.prompt("Please enter alias for restaurant '" + title[locale]+ "':","");

            if (alias) {
                request({type: 'get_organization', organizationId: id}).then(res => {
                    const organization = res.value;
                    organization.externalIds = organization.externalIds || {};
                    organization.externalIds['com.wix.styles.appId'] = unsafeWindow.window.WixInstance.getAppId();
                    organization.externalIds['com.wix.styles.instanceId'] = unsafeWindow.WixInstance.getInstanceId();
                    organization.externalIds['com.wix.styles.compId'] = componentInfo.compId;
                    organization.externalIds['com.wix.styles.pageId'] = componentInfo.pageId;
                    return request({type:'set_organization', organization, accessToken});
                }).then(res => {
                    return request({type:'set_app_mapping', appId:{platform:'com.openrest', id:alias}, organizationId:id, accessToken});
                }).then(res => {
                    GM_openInTab('https://restaurants.wix.com/?type=wixorders.client.mobile.standalone&restaurantAlias='+alias, {active:true});
                }).catch(e => {
                    alert(e.toString());
                });
            }

        });
    }
    // Your code here...
})();