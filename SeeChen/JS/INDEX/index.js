import { _language } from "../MODULE/Language.js"

window.onload = function() {

    var language = new _language();

    language.loadPageLanguage("./JSON/LANGUAGE/index.json", language.getLanguage());

    const HelloVueApp = {
        data() {

            return {
                message : 'Hello World ...'
            }
        }
    }

    Vue.createApp(HelloVueApp).mount('#testVue')
}