import { _language } from "../MODULE/Language.js"
import { language_click } from "./language.js";

var language = new _language();
var lang_url = "./JSON/LANGUAGE/index.json";
var nav_lang = "./JSON/LANGUAGE/navigation_bar.json";
var index_home = "./JSON/LANGUAGE/index_home.json";
var home_timeline = "./JSON/LANGUAGE/home_timeline.json";
var index_lens = "./JSON/LANGUAGE/index_lens.json";
var index_lens_img_tags = "./JSON/LANGUAGE/index_lens_img_tags.json";
var index_lens_details = "./JSON/LANGUAGE/index_lens_details.json";
var travel_lang = "./JSON/LANGUAGE/travel.json";

var current_content_margin_left = 0;

let previousWidth = window.innerWidth;

window.onload = function() {

    language.loadPageLanguage(lang_url, language.getLanguage());
    language.loadPageLanguage(nav_lang, language.getLanguage());
    language.loadPageLanguage(index_home, language.getLanguage());
    language.loadPageLanguage(index_lens, language.getLanguage());
    language.loadPageLanguage(index_lens_details, language.getLanguage());
    language.loadPageLanguage(travel_lang, language.getLanguage());

    current_content_margin_left = navigation_bar_onclick();

    language_click(lang_url)
    language_click(nav_lang)
    language_click(index_home)
    language_click(home_timeline)
    language_click(index_lens)
    language_click(index_lens_img_tags)
    language_click(index_lens_details)
    language_click(travel_lang)

    SlideLeftAndRight();
    asyncFunction();
    projects();

    $(window).resize(function() {

        travel_background_animation()

        let currentWidth = window.innerWidth;
        if (currentWidth !== previousWidth) {

            lensLayout();
            language.loadPageLanguage(index_lens_img_tags, language.getLanguage());

            previousWidth = currentWidth;
        }
    });

    travel_background_animation();
    loadingTravelMore();
}

async function asyncFunction() {
    let _temp_timeline = await loadTimeLine();
    language.loadPageLanguage(home_timeline, language.getLanguage());

    let _temp_lens_img = await lensLayout();
    language.loadPageLanguage(index_lens_img_tags, language.getLanguage());
}

function SlideLeftAndRight() {
    var start_x;
    var end_x;
    var content_margin_left = 0;
    var content_split_width = parseFloat($('#main_content_table').css('width')) / 5;

    $('#content_area').on('touchstart', function(e) {

        start_x = e.originalEvent.changedTouches[0].pageX
        content_margin_left = parseFloat($('#main_content_table').css('margin-left')) / content_split_width;
    });

    $('#content_area').on('touchend', function(e) {

        end_x = e.originalEvent.changedTouches[0].pageX

        let X = end_x - start_x;

        if(X > 50) {
            if(content_margin_left % 1 != 0) {
                content_margin_left = Math.ceil(content_margin_left)
            }

            if(content_margin_left != 0) {

                content_margin_left = content_margin_left + 1
                $('#main_content_table').css('margin-left', ((content_margin_left) * 100) + '%')
            }
        } else if(X < -50) {
            if(content_margin_left % 1 != 0) {
                content_margin_left = Math.floor(content_margin_left)
            }

            if(content_margin_left != -4) {

                content_margin_left = content_margin_left - 1
                $('#main_content_table').css('margin-left', ((content_margin_left) * 100) + '%')
            }
        }

    });

    // $('#content_area').on('touchmove', function(e) {

    //     end_x = e.originalEvent.changedTouches[0].pageX
    //     let X = end_x - start_x;

    //     var temp_margin_left = parseFloat($('#main_content_table').css('margin-left'))
    //     temp_margin_left = temp_margin_left + X + 'px'
    //     console.log(temp_margin_left)
    //     $('#main_content_table').css('margin-left', temp_margin_left)
    // });
}