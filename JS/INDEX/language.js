
import { _language } from "../MODULE/Language.js"

export function language_click(lang_url) {

    var language = new _language();

    $("#choose_english").click(function() {

        language.loadPageLanguage(lang_url, "en");
        
        var d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = `expires=${d.toGMTString()}`;
        document.cookie = `user_language=en;${expires};path=/`;
    });

    $("#choose_chinese").click(function() {

        language.loadPageLanguage(lang_url, "zh");

        var d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = `expires=${d.toGMTString()}`;
        document.cookie = `user_language=zh;${expires};path=/`;
    });
}