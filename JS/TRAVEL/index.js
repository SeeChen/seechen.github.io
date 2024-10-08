
import { _language } from "../MODULE/Language.js"
import { language_click } from "../INDEX/language.js";

var language = new _language();
var url_lang = "../JSON/LANGUAGE/travel_index.json"

window.onload = function() {

    language.loadPageLanguage(url_lang, language.getLanguage());

    $(document).ready(displayAll());
}

function displayAll() {

    $('#page_title').css({
        'font-size': '3em',
        'margin-top': '1em'
    });


    $('#maps_box').css('opacity', 1);
}

function setMapsSize () {

    var svg_obj = $('#world_maps')[0]
    let svgDoc = svg_obj.contentDocument;
    let svgElement = svgDoc.querySelector('svg')

    console.log(svgElement.getBBox())
}