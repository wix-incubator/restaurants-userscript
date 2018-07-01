// ==UserScript==
// @version      1.1.0
// @author       Wix Restaurants
// @description  Sets all that is needed to open the restaurant's online ordering in standalone mode using 'alias'.
// @name         Setup Standalone Link
// @match        http://alpha.wixrestaurants.com/*
// @match        https://apps.wixrestaurants.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    const request = (params) => {
        return fetch('https://api.wixrestaurants.com/v1.1', {
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

        return fetch('https://auth.wixrestaurants.com/v1.0', {
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

    const full = unsafeWindow.full || {};
    const organization = full.restaurant || full.chain;

    if ((organization.id) &&
        (unsafeWindow.Wix) && (unsafeWindow.WixInstance.getPermissions() === 'owner') &&
        (unsafeWindow.WixInstance.getAppId() === '13e8d036-5516-6104-b456-c8466db39542' /* orders */)) {
        let {locale, title, id, alias} = organization;

        let componentInfo = null;
        unsafeWindow.Wix.getComponentInfo(function(e) {
            componentInfo = e;
        });

        let accessToken = null;
        authenticate().then(res => accessToken = res.accessToken);

        const button = $("<div style='position:fixed;z-index:10000000;top:0px;left:0px;width:20px;height:20px;background:green;text-align:center;line-height:20px;color:white;box-shadow:1px 1px 1px rgba(0,0,0,0.5);cursor:pointer;border-radius:50%'>M</div>").appendTo($(unsafeWindow.body));
        button.on('click', () => {
            
            if (!alias) {
                alias = unsafeWindow.prompt("Please enter alias for organization '" + title[locale]+ "':","");
            }

            if (alias) {
                fetch(`https://api.wixrestaurants.com/v2/organizations/${id}`).then(organization => {
                    organization.externalIds = organization.externalIds || {};
                    organization.externalIds['com.wix.styles.appId'] = unsafeWindow.window.WixInstance.getAppId();
                    organization.externalIds['com.wix.styles.instanceId'] = unsafeWindow.WixInstance.getInstanceId();
                    organization.externalIds['com.wix.styles.compId'] = componentInfo.compId;
                    organization.externalIds['com.wix.styles.pageId'] = componentInfo.pageId;
                    return fetch(`https://api.wixrestaurants.com/v2/organizations/${id}`, {
                        headers: new Headers({
                            'Authorization': `Bearer ${accessToken}`, 
                            'Content-Type': 'application/json'
                        }), 
                        body: JSON.stringify(organization)
                    });
                }).then(res => {
                    return request({type:'set_app_mapping', appId:{platform:'com.openrest', id:alias}, organizationId:id, accessToken});
                }).then(res => {
                    GM_openInTab('https://apps.wixrestaurants.com/?type=wixorders.client.mobile.standalone&restaurantAlias='+alias+'&restaurantSource=&restaurantPlatform=', {active:true});
                }).catch(e => {
                    alert(e.toString());
                });
            }

        });
    }
    // Your code here...
})();
