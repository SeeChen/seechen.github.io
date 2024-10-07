function travel_background_animation() {

    var travel_background_p1 = $(".travel_bg_p1:eq(0)")
    var travel_background_p2 = $(".travel_bg_p2:eq(0)")
    var travel_background_p3 = $(".travel_bg_p3:eq(0)")

    travel_background_p1.css('z-index', '-1')
    travel_background_p3.css('z-index', '1')

    travel_background_p1.css('transition', 'all 0.5s')
    travel_background_p2.css('transition', 'all 0.5s')
    travel_background_p3.css('transition', 'all 0.5s')

    var travel_bg_p1_left = parseInt(travel_background_p1.css('left'));
    var travel_bg_p1_width = parseInt(travel_background_p1.css('width'));

    travel_background_p1.css('left', `${travel_bg_p1_left - 10}px`)
    travel_background_p2.css('left', `${travel_bg_p1_left + travel_bg_p1_width - 10 - 1}px`)
    travel_background_p3.css('left', `${travel_bg_p1_left + 2 * travel_bg_p1_width - 10 - 1}px`)

    var travel_bg_p2_left = parseInt(travel_background_p2.css('left'));

    if (travel_bg_p2_left < 0) {

        travel_background_p2.css('left', `${travel_bg_p2_left - 10}px`);

        travel_background_p1.css('transition', 'all 0s');
        travel_background_p1.css('left', `${parseInt(travel_background_p2.css('left')) + 2 * travel_bg_p1_width}px`);

        travel_background_p1.attr('class', 'travel_bg_p3 background_earth');
        travel_background_p2.attr('class', 'travel_bg_p1 background_earth');
        travel_background_p3.attr('class', 'travel_bg_p2 background_earth');
    }

    setTimeout(() => {

        travel_background_animation();
    }, 100);
}

function loadingTravelMore() {

    $('#travel_more').css('top', `${$('#travel_title')[0].getBoundingClientRect().bottom + 10}px`);
    travelMoreClick();
}

function travelMoreClick() {

    $('#travel_more').on('click', function() {

        $('#background_animation').css('transition', 'all 0.5s');
        
        $('#background_animation').css('top', '100vh');
        $('#navigation_bar').css('bottom', '-10em');
        $('#travel_more').css('top', '100vh');
    })
}