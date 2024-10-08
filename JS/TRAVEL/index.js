
import { _language } from "../MODULE/Language.js"
import { language_click } from "../INDEX/language.js";

var language = new _language();
var url_lang = "../JSON/LANGUAGE/travel_index.json"

window.onload = function() {

    language.loadPageLanguage(url_lang, language.getLanguage());
}