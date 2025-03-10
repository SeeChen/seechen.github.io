
import { _language } from "../MODULE/Language.js"
import { language_click } from "../INDEX/language.js";

import { currentNational } from "./national.js";
import { nationalMapsAction } from "./national.js";

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

var country_maps = new currentNational();

window.onload = function() {

    world_slide_show(-1);

    travelScroll();

    window.previousClick = previousClick;
    window.traveledClick = traveledClick;
    window.traveledProvinceClick = traveledProvinceClick;
    window.img_click = img_click;

    language.loadPageLanguage(url_lang, language.getLanguage());
    language.loadPageLanguage(nationa_name, language.getLanguage());

    $(`#${language.getLanguage()}_box_footprint_world`).addClass('display_story_content')

    $(document).ready(displayAll());

    worldMapsAction();

    //  var ___national_maps_action = nationalMapsAction(country_maps);

    // traveledClick();
    traveledHover();

    travelStoryScroll();

    $('#travel_story_close_btn').on('click', function() {
        
        $('#my_travel_story').css('top', '100vh');
    })

    img_show_close_btn();
}

function img_click(obj) {

    let img_data = JSON.parse(obj.getAttribute('img_data'));
    $('#show_img > p:nth-child(2)').text(img_data['title']);
    $.getJSON('/JSON/LANGUAGE/travel_national.json').then(
        countryName => {

            return $.getJSON(`/JSON/LANGUAGE/Country/travel_national_${img_data['country']}.json`).then(provinceName => {
                return { countryName, provinceName };
            });
        }).then(({countryName, provinceName}) => {

            let img_location = '';
            let current_lang = language.getLanguage();
            if (current_lang === 'zh') {

                img_location = `${countryName['zh'][0][img_data['country']]}${provinceName['zh'][0][img_data['province']]}${img_data['city']}.`;
            } else {

                img_location = `${img_data['city']}, ${provinceName[current_lang][0][img_data['province']]}, ${countryName[current_lang][0][img_data['country']]}.`;
            }

            $('#show_img > p:nth-child(3)').text(img_location);
        });
    
    $('#show_img > img:nth-child(4)').attr('src', img_data['url'])

    let img_labels = img_data['label'];
    let img_label_html = '';
    img_labels.forEach(function(img_label) {

        img_label_html += `<span label_id="${img_label}">${img_label}</span>`;
    });
    $('#show_img > p:nth-child(5)').html(img_label_html);
    $('#show_img > p:nth-child(6)').text(img_data['desc']);

    $('#show_img').css({
        'top': 0,
        'opacity': 1,
        'pointer-events': 'auto'
    });
}

function img_show_close_btn() {

    $('#show_img p').click(function() {

        $('#show_img').scrollTop(0);

        $('#show_img').css({
            'top': '5em',
            'opacity': 0,
            'pointer-events': 'none'
        });
    });
}

function travelStoryScroll() {

    $('#my_travel_story').scroll(function() {

        var travel_title = $('.display_in_more:eq(0)')
        
        if (travel_title.offset().top < -1 * travel_title.outerHeight()) {

            $('#travel_story_top_bar').css('top', '0em');
            $('#travel_story_top_bar > p:first-child').text(travel_title.text())
        }

        if (travel_title.offset().top > -1 * travel_title.outerHeight()) {

            $('#travel_story_top_bar').css('top', '-4em');
        }
    })

    $('#travel_story_top_bar > p:nth-child(2)').on('click', function () {

        // $('#my_travel_story').animate({ scrollTop: 0 }, 'fast')
        $('#travel_story_close_btn')[0].dispatchEvent(new Event('click'))
        $('#travel_story_top_bar').css('top', '-4em');
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

    $('body')[0].addEventListener('wheel', (e) => {

        if(e.deltaY > 20) {

            $('#my_travel_story').css('top', 0);
        }
    })

    $('body')[0].addEventListener('keydown', (e) => {

        if (e.key == "ArrowDown") {

            $('#my_travel_story').css('top', 0);
        }
    })

    var start_y, end_y;
    $('body')[0].addEventListener('touchstart', (e) => {

        start_y = e.changedTouches[0].pageY;
        // console.log(start_y)
    })

    $('body')[0].addEventListener('touchend', (e) => {

        end_y = e.changedTouches[0].pageY;
        // console.log(end_y)

        var Y = end_y - start_y;
        // console.log(Y)
        if (Y < -100) {

            $('#my_travel_story').css('top', 0);
        }
    })
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

            country_maps.set_currentNational(element.id);
            nationalMapsAction(country_maps)

            var national_maps = $(`#${element.id}_map`)[0].contentDocument;
            national_maps.addEventListener('wheel', (e) => {

                if(e.deltaY > 20) {
        
                    $('#my_travel_story').css('top', 0);
                }
            })
            national_maps.addEventListener('keydown', (e) => {
        
                if (e.key == "ArrowDown") {
        
                    $('#my_travel_story').css('top', 0);
                }
            })
            national_maps.addEventListener('keydown', (e) => {
        
                if (e.key == "ArrowDown") {
        
                    $('#my_travel_story').css('top', 0);
                }
            })
            var start_y, end_y;
            national_maps.addEventListener('touchstart', (e) => {
        
                start_y = e.changedTouches[0].pageY;
                // console.log(start_y)
            })
            national_maps.addEventListener('touchend', (e) => {
        
                end_y = e.changedTouches[0].pageY;
                // console.log(end_y)
        
                var Y = end_y - start_y;
                // console.log(Y)
                if (Y < -100) {
        
                    $('#my_travel_story').css('top', 0);
                }
            })


            nationalShow = true

            $('.display_in_more:eq(0)').removeClass('display_in_more')
            // $(`#box_footprint_content`).addClass('display_in_more')
            $(`#travel_story_title_${element.id}`).addClass('display_in_more')
            $('.display_story_content:eq(0)').removeClass('display_story_content')
            $(`#box_footprint_content`).addClass('display_story_content')
            // $(`#${language.getLanguage()}_box_footprint_${element.id}`).addClass('display_story_content')

            // to add more
            $(`#footprint_content_header p`).text($('#page_title').text());
            $.getJSON(`/JSON/LANGUAGE/${element.id}/${element.id}.json`, function(conutry_content) {

                let current_lang = language.getLanguage();

                let bg_setup = conutry_content.bg;
                $('#footprint_content_header').css({
                    "background": `url(${bg_setup.url}), #1aa`,
                    "background-size": "cover",
                    "background-position": `${bg_setup.x} ${bg_setup.y}`,
                    "background-repeat": "no-repeat"
                });

                $('#footprint_content_description').text(conutry_content[current_lang][0]['_description_']);
            })

            $.getJSON('/JSON/LAYOUT/travel_gallery.json').then(

                imgList => {
                    
                    return $.getJSON('/JSON/LANGUAGE/travel_national.json').then(countryName => {
                        return { imgList, countryName };
                    });
                }).then(

                    data => {
                        
                        return $.getJSON(`/JSON/LANGUAGE/Country/travel_national_${element.id}.json`).then(provinceName => {
                            data.provinceName = provinceName;
                            return data;
                        });
                }).then(({ imgList, countryName, provinceName }) => {

                    var province_names = new Set(imgList.filter(item => item.country === element.id).map(item => item.province));
                    
                    $('#province_list').html('');
                    var traveled_province = `<p>${$('#national_list p:first-child').text()}</p>`;
                    province_names.forEach(function(value) {

                        traveled_province += `
                            <span id="traveled_${element.id}_${value}" class="traveled_country" onclick="traveledProvinceClick(this)">
                                ${provinceName[language.getLanguage()][0][value]}
                            </span>
                        `;

                    });
                    $('#province_list').html(traveled_province);
                    

                    var img_gallery = imgList.filter(item => 
                        item['country'] === element.id
                    );
    
                    $('#footpring_content_img_area').html("");
                    for (let _i = 0; _i < img_gallery.length; _i++) {
                        let _label_content = '';
                        for (let _j = 0; _j < img_gallery[_i]['label'].length; _j++) {
    
                            _label_content += `<span>${img_gallery[_i]['label'][_j]}</span>`;
                        }
    
                        $('#footpring_content_img_area').html( $('#footpring_content_img_area').html() + 
                            `<div class="footprint_content_img" onclick="img_click(this)" style="
                                background-image: url(${img_gallery[_i]['url']});
                                background-size: cover;
                                background-position: center;
                                background-repeat: no-repeat;
                            "
                            img_data="
                                ${JSON.stringify(img_gallery[_i]).replace(/"/g,'&quot;')}
                            "
                            >
                                <div>
                                    <p>${img_gallery[_i]['title']}</p>
                                    <p>${img_gallery[_i]['city']}, ${provinceName[language.getLanguage()][0][img_gallery[_i]['province']]}, ${countryName[language.getLanguage()][0][img_gallery[_i]['country']]}.</p>
                                    <p>${_label_content}</p>
                                    <p>${img_gallery[_i]['desc']}</p>
                                </div>
                            </div>`
                        );
                    }
                });

            $('#maps_box').css('opacity', 0);
            $('#maps_box').css('z-index', -1);

            $('#national_maps_box').css('transition', 'all 0.5s')

            $('#back_previous').css('z-index', '11');

            $('#national_list').css({
                'bottom': '-5em',
                'pointer-events': 'none'
            });
            $('#province_list').css({
                'bottom': '1em',
                'pointer-events': 'auto'
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

    country_maps.clear_national();

    if (nationalShow) {

        $('.display_in_more:eq(0)').removeClass('display_in_more')
        $(`#travel_story_title`).addClass('display_in_more')
        $('.display_story_content:eq(0)').removeClass('display_story_content')
        $(`#${language.getLanguage()}_box_footprint_world`).addClass('display_story_content')

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
                $('#province_list').css({
                    'bottom': '-5em',
                    'pointer-events': 'none'
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

export function traveledProvinceClick(btn_traveled) {

    let country_id = btn_traveled.id.split('_')[1]
    let province_id = btn_traveled.id.split('_')[2]

    var svg_obj = $(`#${country_id}_map`)[0];
    let svgDoc = svg_obj.contentDocument;

    const province_to_show = svgDoc.getElementById(province_id);

    province_to_show.dispatchEvent(new Event('mouseenter'));
    setTimeout(() => {
        
        province_to_show.dispatchEvent(new Event('click'));
        province_to_show.dispatchEvent(new Event('mouseout'));

        // $('#national_list').removeClass('hover_national_list');
    }, 100);
}

function traveledHover() {

    $('.traveled_list').on('mouseenter', function(){

        $(this).addClass('hover_national_list')
    });

    $('.traveled_list').on('mouseleave', function(){

        $(this).removeClass('hover_national_list')
    });
}