export class _language {

    #language = navigator.language;

    constructor() {}

    #FilterLanguage() {

        switch (this.#language.substring(0, 2)) {

            case "zh" :
                return "zh";
                break;
        
            case "en" :
            default :
                return "en";
                break;
        }
    }

    getLanguage () {

        var cookieLanguage = document.cookie;

        if (cookieLanguage.includes("user_language")) {

            if (cookieLanguage.includes(";")) {
                var cookieTemp = cookieLanguage[";"];
            } else {
    
                var cookieTemp = [cookieLanguage];
            }
            for (let _i = 0; _i < cookieTemp.length; _i++) {
                var _c = cookieTemp[_i].trim();
                if (_c.indexOf("user_language=") == 0) {
                    return _c.split("=")[1];
                }
            }
        } else {

            var d = new Date();
            d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
            var expires = `expires=${d.toGMTString()}`;
            document.cookie = `user_language=${this.#FilterLanguage()};${expires};path=/`;

            return this.#FilterLanguage();
        }
    }

    loadPageLanguage(languageUrl, lang) {

        $.getJSON(languageUrl, function(data) {

            let languageObj = data[lang][0];

            $("title:eq(0)").text(languageObj._title_);

            for (let i = 0; i < $("._switch_lang_").length; i++) {

                $("._switch_lang_:eq(" + i + ")").html(languageObj[$("._switch_lang_:eq(" + i + ")").attr("lang_obj")]);
            }
        });
    }
}