
export class userLanguage {

    #language = navigator.language;

    constructor() {}

    #filterLanguage() {

        const currentLanguage = this.#language.substring(0, 2);
        switch (currentLanguage) {

            case "zh":
            case "en":
                return currentLanguage;

            default:
                return "en";
        }
    }

    getLanguage() {

        const cookieLanguage = document.cookie;

        if (cookieLanguage.includes("userLanguage")) {
            if (cookieLanguage.includes(";")) {
                var cookieLanguageTemp = cookieLanguage.split(";");
            } else {
                var cookieLanguageTemp = [cookieLanguage];
            }

            for (let i = 0; i < cookieLanguageTemp.length; i++) {
                let c = cookieLanguageTemp[i].trim();
                if (c.indexOf("userLanguage=") == 0) {
                    return c.split("=")[1];
                }
            }
        } else {

            var d = new Date();
            d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
            var expires = `expires=${d.toGMTString()}`;
            document.cookie = `userLanguage=${this.#filterLanguage()};${expires};path=/`;

            return this.#filterLanguage();
        }
    }

    switchLanguage(language) {

        var d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = `expires=${d.toGMTString()}`;
        document.cookie = `user_language=${language};${expires};path=/`;
    }
}