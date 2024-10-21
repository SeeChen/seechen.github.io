
import { _language } from "../MODULE/Language.js"
import { language_click } from "../INDEX/language.js";

var language = new _language();

export class currentNational {

    #current_national;

    constructor() {

        this.#current_national = 'worlds';
    }

    set_currentNational (newNational) {

        this.#current_national = newNational;
    }

    get_currentNational () {

        return this.#current_national;
    }

    clear_national () {

        this.#current_national = 'worlds';
    }
}

export function nationalMapsAction(country_object) {

    if (country_object.get_currentNational === 'worlds') {
        return 0;
    }

    var svg_obj = $(`#${country_object.get_currentNational()}_map`)[0]
    let svgDoc = svg_obj.contentDocument;
    let visitedC = svgDoc.querySelectorAll('.visited')

    let Province_Name;
    let National_Name;

    $.getJSON(`/JSON/LANGUAGE/Country/travel_national_${country_object.get_currentNational()}.json`, function(_province_name) {

        Province_Name = _province_name;
    })
    $.getJSON(`/JSON/LANGUAGE/travel_national.json`, function(_national_name) {

        National_Name = _national_name;
    })

    visitedC.forEach(element => {

        element.addEventListener('mouseenter', () => {

            $('#page_title').text(Province_Name[language.getLanguage()][0][element.id]);
        })
    });

    visitedC.forEach(element => {

        element.addEventListener('mouseout', () => {

            $('#page_title').text(National_Name[language.getLanguage()][0][country_object.get_currentNational()]);
        })
    });
}