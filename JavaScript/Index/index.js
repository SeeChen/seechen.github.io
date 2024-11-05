
import { route } from "../General/route.js";
import { getJson } from "../General/getJson.js";
import { userLanguage } from "../General/language.js";
import { createElement, render, patch, vNodeDiff } from "../General/VirtualDOM.js";

window.globalValues = {

    translateData: {},
    language: ""
}

window.addEventListener("DOMContentLoaded", () => {

    let PathName = window.location.pathname;
    console.log(PathName);
});

window.onload = async function() {

    window.route = route;
    window.globalValues.language = new userLanguage().getLanguage();
    await getData();
    
    document.title = window.globalValues.translateData.index[window.globalValues.language]._title_;
}

async function getData() {
    try {
        var translateIndex = await getJson("/Language/Index/index.json");
        window.globalValues.translateData.index = translateIndex;
    } catch (err) {
        console.error(err);
    }
}

