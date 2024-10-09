
import { _language } from "../MODULE/Language.js"
import { language_click } from "../INDEX/language.js";

var language = new _language();
var url_lang = "../JSON/LANGUAGE/travel_index.json";
var nationa_name = "/JSON/LANGUAGE/travel_national.json"

var nationalShow = false
var worldPosition = {
    'top': 0,
    'left': 0,
    'width': 0,
    'height': 0
}

window.onload = function() {

    window.previousClick = previousClick;
    window.traveledClick = traveledClick;

    language.loadPageLanguage(url_lang, language.getLanguage());
    language.loadPageLanguage(nationa_name, language.getLanguage());

    $(document).ready(displayAll());

    worldMapsAction();
    nationalMapsAction();

    traveledClick();
}

function nationalMapsAction() {

    var svg_obj = $('.national_map')
    // console.log(svg_obj)
    // let svgDoc = svg_obj.contentDocument;
    // let visitedC = svgDoc.querySelectorAll('.visited')
}

function worldMapsAction() {

    var svg_obj = $('#world_maps')[0]
    let svgDoc = svg_obj.contentDocument;
    let visitedC = svgDoc.querySelectorAll('.visited')

    let national_name;

    $.getJSON('/JSON/LANGUAGE/travel_national.json', function(_national_name) {

        national_name = _national_name;
    })

    visitedC.forEach(element => {

        element.addEventListener('mouseenter', () => {

            $('body').css({
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'top center'
            });

            $('#page_title').text(national_name[language.getLanguage()][0][element.id]);

            // element.style.opacity = '0'
            
            let current_rect = element.getBoundingClientRect();
            let rect_2 = $('#world_maps')[0].getBoundingClientRect();

            worldPosition['width'] = current_rect.width;
            worldPosition['height'] = current_rect.height;
            worldPosition['top'] = current_rect.top + rect_2.top;
            worldPosition['left'] = current_rect.left + rect_2.left;

            $('#national_maps_box').css({
                'width': worldPosition['width'],
                'height': worldPosition['height'],
                'top': worldPosition['top'],
                'left': worldPosition['left']
            });

            $(`#${element.id}_map`).css('display', 'block')
        });

        element.addEventListener('mouseout', () => {

            if (!nationalShow) {

                $('body').css('background', '#d8dad7')
                language.loadPageLanguage(url_lang, language.getLanguage());
                $(`#${element.id}_map`).css('display', 'none')

                // element.style.opacity = '1'
            }
        });

        element.addEventListener('click', () => {

            nationalShow = true

            $('#maps_box').css('opacity', 0);
            $('#maps_box').css('z-index', -1);

            $('#national_maps_box').css('transition', 'all 0.5s')

            $('#back_previous').css('z-index', '11');

            $('#national_list').css({
                'bottom': '-10em',
                'pointer-events': 'none'
            });

            setTimeout(() => {
                
                $('#national_maps_box').css({
                    'width': '80vw',
                    'height': '80vh',
                    'top': '10vh',
                    'left': '10vw'
                });

                setTimeout(() => {
                    $('#back_previous').css('opacity', '1')
                }, 500);
            }, 300);
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

export function previousClick(btn_pre) {

    if (nationalShow) {

        btn_pre.style.opacity = 0;
        btn_pre.style.zIndex = -1;

        $('#national_maps_box').css({
            'width': worldPosition['width'],
            'height': worldPosition['height'],
            'top': worldPosition['top'],
            'left': worldPosition['left']
        });

        setTimeout(() => {
            
            nationalShow = false;
            language.loadPageLanguage(url_lang, language.getLanguage());

            $('#maps_box').css('opacity', 1);
            $('#maps_box').css('z-index', 4);

            setTimeout(() => {

                $('#national_maps_box').css('transition', 'all 0s')
                $('#national_maps_box')[0].querySelector('object[style*="display: block"]').style.display = 'none'

                $('#national_list').css({
                    'bottom': '1em',
                    'pointer-events': 'auto'
                });

            }, 300);
        }, 600);
    }
}

export function traveledClick(btn_traveled) {

    var svg_obj = $('#world_maps')[0];
    let svgDoc = svg_obj.contentDocument;

    let country_id = btn_traveled.id.split('_')[1]
    const country_to_show = svgDoc.getElementById(country_id)

    country_to_show.dispatchEvent(new Event('mouseenter'));
    setTimeout(() => {
        
        country_to_show.dispatchEvent(new Event('click'));
        country_to_show.dispatchEvent(new Event('mouseout'));
    }, 100);
}