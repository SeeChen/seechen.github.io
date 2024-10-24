var details_show = false

function lensLayout() {

    return new Promise((resolve, reject) => {

        let Client_Width = $('.lens_content')[0].clientWidth;
        $('.lens_content:eq(0)').css('display', 'none');
        $.getJSON('../../JSON/LAYOUT/lens_image.json', function(data) {

            data.sort(function() {
                return Math.random() - 0.5;
            })

            $('#area_lens_content').html("")
            for(let i = 0; i < data.length; i++) {

                img_name = data[i]['name'].split('.')[0]
                img_src = `./MATERIALS/LENS/${data[i]['name']}`
                img_h = data[i]['height']
                img_w = data[i]['width']
                newHeight = img_h * (Client_Width / img_w) * 0.625
                img_tag = data[i]['img-tag']
                
                $('#area_lens_content').html(
                    $('#area_lens_content').html()
                    + '<div class="lens_content">'
                    + `<img id="img${img_name}" src="${img_src}" alt="" onclick="lensClick(this, '${JSON.stringify(data[i]).replace(/"/g,'&quot;')}', '${img_name}')" onmouseover="lensMouseOver(this)" onmouseout="lensMouseOut(this)">`
                    + '<p class="img_tag">'
                    + `<span class="_switch_lang_" lang_obj="${img_tag[0]}"></span>&nbsp;`
                    + `<span class="_switch_lang_" lang_obj="${img_tag[1]}"></span>&nbsp;`
                    + `<span class="_switch_lang_" lang_obj="${img_tag[2]}"></span>&nbsp;`
                    + '</p></div>'
                );

                $('.lens_content:eq(' + i + ')').css("grid-row-end", `span ${Math.floor(newHeight) + 1}`);
            }
        });

        resolve("Success");
    });
}

function lensMouseOver(obj) {

    let thisImg = obj

    obj.style.opacity = 0.5
    obj.style.filter = "grayscale(100%)"
    
    let img_src = thisImg.src
    let img_w = thisImg.offsetWidth;
    let img_h = thisImg.offsetHeight;

    const rect = thisImg.getBoundingClientRect();
    let top = rect.top;
    let left = rect.left;

    if (!window.matchMedia('(max-width: 750px)').matches) {
        $('#lens_details').css('opacity', '1')
    }

    $('#lens_details').css('top', top)
    $('#lens_details').css('left', left)
    $('#lens_details').css('width', img_w)
    $('#lens_details').css('height', img_h)

    $('#lens_details > div:first-child').css('height', img_h)
    $('#lens_details > div:first-child').css('width', img_w)

    $('#lens_details > div:first-child').css('transform', 'scale(1.1)')
    $('#lens_details').css('z-index', '5')

    $('#lens_details > div:first-child').css('background', `url(${img_src})`)
    $('#lens_details > div:first-child').css('background-repeat', 'no-repeat')
    $('#lens_details > div:first-child').css('background-size', 'contain')
    $('#lens_details > div:first-child').css('background-position', 'center')
}

function lensMouseOut(obj) {

    let thisImg = obj
    
    let img_w = thisImg.offsetWidth;
    let img_h = thisImg.offsetHeight;

    const rect = thisImg.getBoundingClientRect();
    let top = rect.top;
    let left = rect.left;

    if (!details_show) {

        obj.style.opacity = 1
        obj.style.filter = "grayscale(0%)"

        $('#lens_details').css('top', top)
        $('#lens_details').css('left', left)
        $('#lens_details').css('width', img_w)
        $('#lens_details').css('height', img_h)

        $('#lens_details > div:first-child').css('width', img_w)
        $('#lens_details > div:first-child').css('height', img_h)

        $('#lens_details').css('transform', 'scale(1)')
        $('#lens_details > div:first-child').css('transform', 'scale(1)')

        $('#lens_details').css('opacity', '0')
    }
}

function lensClick(obj, str_img_data, currentIndex) {

    if (window.matchMedia('(max-width: 750px)').matches) {

        $('#lens_details').addClass('details_on_phone');
        obj.dispatchEvent(new Event('mouseenter'));
        setTimeout(() => {
            
            $('#lens_details').removeClass('details_on_phone');
            lensClickInner(obj, str_img_data, currentIndex);
        }, 150);
    } else {

        lensClickInner(obj, str_img_data, currentIndex);
    }
}

function lensClickInner(obj, str_img_data, currentIndex) {

    details_show = true;

    obj.style.opacity = 0
    $('#current_index').text(currentIndex)

    $('#lens_details').css('transition', '')
    
    $('#lens_details').css('top', 0)
    $('#lens_details').css('left', 0)
    $('#lens_details').css('width', '100%')
    $('#lens_details').css('height', '100vh')
    $('#lens_details').css('z-index', '5')
    $('#lens_details').css('opacity', '1')
    $('#lens_details').css('background', 'rgba(0, 0, 0, 0.6)')

    $('#lens_details').css('pointer-events', 'auto')
    $('#lens_details > div:first-child').css('pointer-events', 'auto')
    
    $('#details_btn_quit').css('opacity', 1)

    $('#navigation_bar').css('bottom', '-5em')

    img_data = JSON.parse(str_img_data)

    img_height = img_data['height']
    img_width = img_data['width']

    $('#details_img_name').text(img_data['name']);
    $('#details_img_name').css('opacity', '1');

    $('#details_watermark').css('opacity', 1)
    $('#details_model_name').text(img_data['camera-model']);
    $('#details_date_time').text(`${img_data['date']} ${img_data['time']}`);
    $('#details_parameter').html(
        `&nbsp;&nbsp;
        ${img_data['focal-length']}&nbsp;&nbsp;&nbsp;${img_data['f-stop']}&nbsp;&nbsp;&nbsp;${img_data['exposure-time']}&nbsp;&nbsp;&nbsp;${img_data['iso-speed'].replace('-', ' ')}
        `
    );
    $('#details_coordinate').html(
        `
        <a href='https://uri.amap.com/marker?position=${img_data['latitude']},${img_data['longitude']}' target='_blank'>
        &nbsp;&nbsp;
        ${img_data['longitude'].toFixed(4)},&nbsp;&nbsp;&nbsp;&nbsp;${img_data['latitude'].toFixed(4)}
        </a>
        `
    );
    $('#details_logo').html(
        `<img src="../MATERIALS/COMPANYLOGO/${img_data['camera-make']}.png"/>`
    )

    const media_width_750 = window.matchMedia('(max-width: 750px)')
    if(media_width_750.matches) {

        $('#lens_details > div:first-child').css('transform', 'scale(2)')
        if (img_height >= img_width) {

            $('#details_watermark').css('bottom', '10em')
        } else {

            $('#details_watermark').css('bottom', '30em')
        }
    } else {

        if (img_height >= img_width) {

            $('#lens_details > div:first-child').css('transform', 'scale(1.75)')
            $('#details_watermark').css('bottom', '2em')
            $('#details_watermark').css('transform', 'scale(0.6)')
        } else {

            $('#lens_details > div:first-child').css('transform', 'scale(2.5)')
            $('#details_watermark').css('bottom', '5em')
            $('#details_watermark').css('transform', 'scale(0.75)')
        }
    }
}

function quitDetails() {

    details_show = false;

    var id_current_image = `#img${$('#current_index').text()}`
    var current_image = $(id_current_image)[0]

    current_image.style.filter = "grayscale(0%)"

    let img_w = current_image.offsetWidth;
    let img_h = current_image.offsetHeight;

    const rect = current_image.getBoundingClientRect();
    let top = rect.top;
    let left = rect.left;

    $('#lens_details').css('top', top)
    $('#lens_details').css('left', left)
    $('#lens_details').css('width', img_w)
    $('#lens_details').css('height', img_h)

    $('#lens_details').css('transition', 'all 0.5s')
    $('#lens_details > div:first-child').css('transition', 'all 0.5s')
    $('#lens_details').css('transform', 'scale(1)')
    $('#lens_details > div:first-child').css('transform', 'scale(1)')
    
    $('#lens_details').css('z-index', '-1')
    $('#lens_details').css('background', 'rgba(0, 0, 0, 0.0)')

    $('#lens_details').css('pointer-events', 'none')
    $('#lens_details > div:first-child').css('pointer-events', 'none')

    $('#details_img_name').css('opacity', 0);

    $('#details_btn_quit').css('opacity', 0)
    $('#details_watermark').css('opacity', 0)

    $('#navigation_bar').css('bottom', '1em')
    const media_width_750 = window.matchMedia('(max-width: 750px)')
    if(media_width_750.matches) {

        $('#navigation_bar').css('bottom', '0')
    }

    setTimeout(() => {

        $('#lens_details').css('opacity', '0')
        current_image.style.opacity = 1
    }, 500);
}