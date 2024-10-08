
import { _language } from "../MODULE/Language.js"
import { language_click } from "../INDEX/language.js";

var language = new _language();
var url_lang = "../JSON/LANGUAGE/travel_index.json";

window.onload = function() {

    language.loadPageLanguage(url_lang, language.getLanguage());

    $(document).ready(displayAll());

    mapsAction();
}

function mapsAction() {

    var svg_obj = $('#world_maps')[0]
    let svgDoc = svg_obj.contentDocument;
    let visitedC = svgDoc.querySelectorAll('.visited')

    let national_name, currentNational;

    $.getJSON('/JSON/LANGUAGE/travel_national.json', function(_national_name) {

        national_name = _national_name;
    })

    visitedC.forEach(element => {
        element.addEventListener('mouseenter', () => {

            if (element.id == 'TW') {

                $('body').css('background', `-webkit-cross-fade(url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==), url('/MATERIALS/National-Flat/CN.jpg'), 30%)`);
                currentNational = 'CN';

            } else {
                $('body').css('background', `-webkit-cross-fade(url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==), url('/MATERIALS/National-Flat/${element.id}.jpg'), 30%)`);
                currentNational = element.id;
            }
            $('body').css({
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'top center'
            });

            $('#page_title').text(national_name[language.getLanguage()][0][currentNational]);
            
            let current_rect = element.getBoundingClientRect();
            let rect_2 = $('#world_maps')[0].getBoundingClientRect();
            $(`#${element.id}_maps_box`).css({
                'width': `${current_rect.width}px`,
                'height': `${current_rect.height}px`,
                'top': `${current_rect.top + rect_2.top}px`,
                'left': `${current_rect.left + rect_2.left}px`
            })

            console.log($('#maps_CN')[0].getBoundingClientRect());
        });

        element.addEventListener('mouseout', () => {

            $('body').css('background', '#d8dad7')
            language.loadPageLanguage(url_lang, language.getLanguage());
        });
    });
}

function displayAll() {

    $('#page_title').css({
        'font-size': '3em',
        'margin-top': '1em'
    });


    $('#maps_box').css('opacity', 1);
}