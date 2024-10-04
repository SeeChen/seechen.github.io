function lensLayout() {

    let Client_Width = $('.lens_content')[0].clientWidth;
    $('.lens_content:eq(0)').css('display', 'none');
    $.getJSON('../../JSON/LAYOUT/lens_image.json', function(data) {

        data.sort(function() {
            return Math.random() - 0.5;
        })

        $('#area_lens_content').html("")
        for(let i = 0; i < data.length; i++) {

            img_src = `./MATERIALS/LENS/${data[i]['name']}`
            img_h = data[i]['height']
            img_w = data[i]['width']
            newHeight = img_h * (Client_Width / img_w) * 0.625
            img_tag = data[i]['img-tag']
            
            $('#area_lens_content').html(
                $('#area_lens_content').html()
                + '<div class="lens_content">'
                + '<img src="' + img_src + '" alt="">'
                + '<p class="img_tag">'
                + '<span>' + img_tag[0] + '</span>&nbsp;'
                + '<span>' + img_tag[1] + '</span>&nbsp;'
                + '<span>' + img_tag[2] + '</span>&nbsp;'
                + '</p></div>'
            );

            console.log($('.lens_content:eq(' + i + ') img').css('height'))

            $('.lens_content:eq(' + i + ')').css("grid-row-end", `span ${Math.floor(newHeight) + 1}`);
        }
    });
}