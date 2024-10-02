import { _language } from "../MODULE/Language.js"
import { language_click } from "./language.js";

var language = new _language();
var lang_url = "./JSON/LANGUAGE/index.json";
var nav_lang = "./JSON/LANGUAGE/navigation_bar.json";
var index_home = "./JSON/LANGUAGE/index_home.json"

window.onload = function() {

    language.loadPageLanguage(lang_url, language.getLanguage());
    language.loadPageLanguage(nav_lang, language.getLanguage());
    language.loadPageLanguage(index_home, language.getLanguage());

    navigation_bar_onclick();

    language_click(lang_url)
    language_click(nav_lang)
    language_click(index_home)
    
}