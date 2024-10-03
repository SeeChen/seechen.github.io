function loadTimeLine() {

    $.getJSON('../../JSON/LAYOUT/home_timeline.json', function(data) {

        LenData = data.length;
        for(var items = 0; items < LenData; items++) {
            let item = data[items]['img'];
            let item_src = './MATERIALS/' + item + '.avif';
            let item_area_id = "area_" + item.replace("-", "_");
            let item_time = item.substring(0, 4) + "." + item.substring(4, 6) + "." + item.substring(6, 8);
            let item_lang_obj = "_t" + item.replace("-", "_") + "_";

            $('#main_timeline').html(
                $('#main_timeline').html()
                + '<div id="' + item_area_id + '">'
                + '<img src="' + item_src + '" alt="">'
                + '<p class="p_time">' + item_time + '</p>'
                + '<p class="_switch_lang_ p_descript" lang_obj="' + item_lang_obj + '"></p>'
                + '</div>'
            )
        }
    })
}