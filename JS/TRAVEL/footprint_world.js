function world_slide_show(x) {

    x = x + 1;
    if (x == 7) {
        x = 0;
    }

    $('#en_box_footprint_world_slide_show table').css('margin-left', `${x * -100}%`);

    setTimeout(() => {
        
        world_slide_show(x);
    }, 5000);
}