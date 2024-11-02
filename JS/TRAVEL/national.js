
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

export function province_img(obj) {

    console.log(obj)
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

    visitedC.forEach(element => {

        element.addEventListener('click', () => {

            $('#travel_story_close_btn').on('click', function() {

                setTimeout(() => {
                    
                    $('.display_in_more:eq(0)').removeClass('display_in_more');
                    $(`#travel_story_title_${country_object.get_currentNational()}`).addClass('display_in_more');
                    $('.display_story_content:eq(0)').removeClass('display_story_content');
                    $(`#box_footprint_content`).addClass('display_story_content');
                }, 500);
            });

            $('#my_travel_story').css('top', 0);

            $('.display_in_more:eq(0)').removeClass('display_in_more');
            $('#travel_story_title_province').addClass('display_in_more');

            $('.display_story_content:eq(0)').removeClass('display_story_content');
            $(`#box_content_province`).addClass('display_story_content');

            $.getJSON(`/JSON/LANGUAGE/Country/travel_national_${country_object.get_currentNational()}.json`, function(province_name) {

                $('#travel_story_title_province').text(province_name[language.getLanguage()][0][element.id]);
                $('#content_province_title').text(province_name[language.getLanguage()][0][element.id]);
            });

            $.getJSON(`/JSON/LANGUAGE/${country_object.get_currentNational()}/${element.id}.json`, function(img_data) {

                var img_show = '';
                for (let _i = 0; _i < img_data['img-path'].length; _i++) {
                    
                    img_show += `
                    <li>
                        <span class="hex">
                            <span class="hexIn" onclick="img_click(this)" style="
                                background: url(${img_data['img-path'][_i]['url']});
                                background-size: cover;
                                background-repeat: no-repeat;
                                background-position: center;
                                position: relative;
                            ">
                                <div>
                                    <p>title</p>
                                </div>
                            </span>
                        </span>
                    </li>
                    `;
                }
                $('#box_content_province ul').html(`${img_show}<div style="clear: both;"></div>`);
            });
        })
    });
}