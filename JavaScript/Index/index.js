
import { vDom } from "../General/VirtualDOM.js";
import { tools } from "../General/tools.js";
import { router } from "../General/route.js";
import { EventBus } from "../General/eventBus.js";
import { userLanguage } from "../General/language.js";

import { SeeChen_Loading } from "../General/loading.js";
import { SeeChen_Navigation, SeeChen_Navigation_Click } from "../General/navigation.js";

import { SeeChen_Footer } from "../General/footer.js";
import { SeeChen_TravelPage } from "../Travel/travel.js";

window.vDom = vDom;
window.router = router;
window.myTools = tools;
window.eventBus = EventBus;

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
    footerPage: SeeChen_Footer,

    currentPages: {}
}

window.myData = {

    travel: {
        TravelList: {}
    }
}

window.webWorker = {}

window.onload = async function() {

    await window.webpages.loadingPage.pageLoading();
    
    window.globalValues.language = new userLanguage().getLanguage();
    await window.myTools.getTranslate();

    document.querySelector("#contentArea").addEventListener("scroll", (e) => {
        EventBus.emit("scrollEvent", e);
    });

    window.webpages.loadingPage.updateProgress(25);

    await window.webpages.footerPage.init();
    await window.webpages.navigationPage.init();

    await window.router.route(window.location.pathname);

    await SeeChen_TravelPage.init();
    SeeChen_TravelPage.registerEvents();

    window.webpages.loadingPage.updateProgress(50);
    
    document.title = window.globalValues.translateData.idx[window.globalValues.language]._title_;

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

