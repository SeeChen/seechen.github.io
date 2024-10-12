
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

    travelScroll();

    window.previousClick = previousClick;
    window.traveledClick = traveledClick;

    language.loadPageLanguage(url_lang, language.getLanguage());
    language.loadPageLanguage(nationa_name, language.getLanguage());

    $(document).ready(displayAll());

    worldMapsAction();
    nationalMapsAction();

    // traveledClick();
    traveledHover();

    $('#travel_story_close_btn').on('click', function() {
        
        $('#my_travel_story').css('top', '100vh');
    })
}

function travelScroll() {

    $('#world_maps')[0].contentDocument.addEventListener('wheel', (e) => {

        if(e.deltaY > 20) {

            $('#my_travel_story').css('top', 0);
        }
    })

    $('#world_maps')[0].contentDocument.addEventListener('keydown', (e) => {

        if (e.key == "ArrowDown") {

            $('#my_travel_story').css('top', 0);
        }
    })

    $(window)[0].addEventListener('keydown', (e) => {

        if (e.key == "ArrowDown") {

            $('#my_travel_story').css('top', 0);
        }
    })

    var start_y, end_y;
    $('#world_maps')[0].contentDocument.addEventListener('touchstart', (e) => {

        start_y = e.changedTouches[0].pageY;
        // console.log(start_y)
    })

    $('#world_maps')[0].contentDocument.addEventListener('touchend', (e) => {

        end_y = e.changedTouches[0].pageY;
        // console.log(end_y)

        var Y = end_y - start_y;
        // console.log(Y)
        if (Y < -100) {

            $('#my_travel_story').css('top', 0);
        }
    })
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
                'bottom': '-5em',
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
            }, 500);
        });
    });
}

function displayAll() {

    $('#page_title').addClass('pagetitle_ready');


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

        $('#national_list').removeClass('hover_national_list');
    }, 100);
}

function traveledHover() {

    $('#national_list').on('mouseenter', function(){

        $(this).addClass('hover_national_list')
    });

    $('#national_list').on('mouseleave', function(){

        $(this).removeClass('hover_national_list')
    });
}