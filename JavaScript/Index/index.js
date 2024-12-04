/* 
    File: index.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/Index/index.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/


import { vDom } from "../General/VirtualDOM.js";
import { tools } from "../General/tools.js";
import { router } from "../General/route.js";
import { EventBus } from "../General/eventBus.js";
import { userLanguage } from "../General/language.js";

import { SeeChen_Loading } from "../General/loading.js";
import { SeeChen_Navigation, SeeChen_Navigation_Click } from "../General/navigation.js";

import { SeeChen_Footer } from "../General/footer.js";
import { SeeChen_TravelPage } from "../Travel/travel.js";
import { SeeChen_LensPages } from "../Lens/lens.js";
import { SeeChen_Pages404 } from "../General/Page404.js";
import { SeeChen_ServicesPages } from "../Services/services.js";
import { SeeChen_ProjectsPage } from "../Projects/projects.js";
import { SeeChen_AboutPage } from "../About/about.js";

window.vDom = vDom;
window.router = router;
window.myTools = tools;
window.eventBus = EventBus;

window.clickEvent = {
    navigation: SeeChen_Navigation_Click,
}

window.globalValues = {

    currentVDom: {},

    nodeToRemove: [],

    translateData: {},
    language: "",

    validRoutes: [
        "/", 
        "/spa/",
        "/home/",
        "/index/",
        "/travel/",
        "/lens/",
        "/services/",
        "/projects/",
        "/about/"
    ]
}

window.webpages = {
    loadingPage: SeeChen_Loading,
    navigationPage: SeeChen_Navigation,
    footerPage: SeeChen_Footer,

    currentPages: {}
}

window.myData = {

    path: [],

    travel: {
        TravelList: {},
        LabelsMap: {},
        CityName: {},
        SelectedLabel: [],

        CurrentImgTopBar: {},
        CurrentImgList: {},
        CurrentImgDetails: {},

        isCountry: false,
        isProvice: false,

        pathParams: {}
    },

    projects: {
        currentDetails: {}
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

    // await SeeChen_AboutPage.init();

    window.webpages.loadingPage.updateProgress(99);
    
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

