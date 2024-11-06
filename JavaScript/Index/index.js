
import { route } from "../General/route.js";
import { getJson } from "../General/getJson.js";
import { userLanguage } from "../General/language.js";
// import { createElement, render, vDOMPatch, vNodeDiff } from "../General/VirtualDOM.js";

import { navigationMenuClick, renderNavigation } from "../General/navigation.js";
import { pageLoaded, pageLoading } from "../General/loading.js";

window.globalValues = {

    currentVDom: {},

    translateData: {},
    language: ""
}

window.clickEvent = {}

window.addEventListener("DOMContentLoaded", () => {

    let PathName = window.location.pathname;
    console.log(PathName);
});

window.onload = async function() {

    pageLoading();

    window.route = route;
    window.globalValues.language = new userLanguage().getLanguage();
    await getData();
    
    document.title = window.globalValues.translateData.index[window.globalValues.language]._title_;

    window.clickEvent.navigationMenuClick = navigationMenuClick;

    renderNavigation();
    console.log(window.globalValues.currentVDom);

    await testLoad();
    pageLoaded();
}

async function testLoad() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("-");
        }, 5000);
    });
}

async function getData() {
    try {
        var translateIndex = await getJson("/Language/Index/index.json");
        window.globalValues.translateData.index = translateIndex;
    } catch (err) {
        console.error(err);
    }
}

