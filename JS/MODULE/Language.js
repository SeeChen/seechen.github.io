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

        return this.#FilterLanguage();
    }

    loadPageLanguage(languageUrl, lang) {

        $.getJSON(languageUrl, function(date) {

            let languageObj = date[lang][0];

            $("title:eq(0)").text(languageObj._title_);

            for (let i = 0; i < $("._switch_lang_").length; i++) {

                $("._switch_lang_:eq(" + i + ")").text(languageObj[$("._switch_lang_:eq(" + i + ")").attr("lang_obj")]);
            }
        });
    }
}