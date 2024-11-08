
import { vDom } from "../General/VirtualDOM.js";
import { tools } from "../General/tools.js";
import { router } from "../General/route.js";
import { userLanguage } from "../General/language.js";

import { SeeChen_Loading } from "../General/loading.js";
import { SeeChen_Navigation, SeeChen_Navigation_Click } from "../General/navigation.js";

import { homeScroll, SeeChen_HomePage } from "../Home/home.js";

window.vDom = vDom;
window.router = router;
window.myTools = tools;

window.clickEvent = {
    navigation: SeeChen_Navigation_Click,
}

window.globalValues = {

    currentVDom: {},

    translateData: {},
    language: ""
}

window.webpages = {
    loadingPage: SeeChen_Loading,
    navigationPage: SeeChen_Navigation,

    currentPages: {}
}

window.webWorker = {}

window.onload = async function() {

    window.webpages.loadingPage.pageLoading();

    window.webpages.currentPages = SeeChen_HomePage;

    window.globalValues.language = new userLanguage().getLanguage();
    await window.myTools.getTranslate();
    await window.webpages.navigationPage.render();

    window.webpages.currentPages.render();
    
    document.title = window.globalValues.translateData.index[window.globalValues.language]._title_;

    // Home
    homeScroll();

    await testLoad();
    window.webpages.loadingPage.pageLoaded();
}

async function testLoad() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("-");
        }, 5000);
    });
}

