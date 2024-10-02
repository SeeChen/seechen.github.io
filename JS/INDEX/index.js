import { _language } from "../MODULE/Language.js"
import { language_click } from "./language.js";

var language = new _language();
var lang_url = "./JSON/LANGUAGE/index.json";
var nav_lang = "./JSON/LANGUAGE/navigation_bar.json";

window.onload = function() {

    language.loadPageLanguage(lang_url, language.getLanguage());
    language.loadPageLanguage(nav_lang, language.getLanguage());

    navigation_bar_onclick();

    language_click(lang_url)
    language_click(nav_lang)
    
}