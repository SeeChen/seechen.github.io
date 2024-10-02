
import { _language } from "../MODULE/Language.js"

export function language_click(lang_url) {

    var language = new _language();

    $("#choose_english").click(function() {

        language.loadPageLanguage(lang_url, "en");
    });

    $("#choose_chinese").click(function() {

        language.loadPageLanguage(lang_url, "zh");
    });
}