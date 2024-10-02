function navigation_bar_onclick() {
    $('#nav_home').click(function() {

        $('#main_content_table').css('margin-left', '0%');
    });
    $('#nav_trips').click(function() {

        $('#main_content_table').css('margin-left', '-100%');
    });
    $('#nav_camera').click(function() {

        $('#main_content_table').css('margin-left', '-200%');
    });
    $('#nav_projects').click(function() {

        $('#main_content_table').css('margin-left', '-300%');
    });
    $('#nav_language').click(function() {

        $('#main_content_table').css('margin-left', '-400%');
    });
}