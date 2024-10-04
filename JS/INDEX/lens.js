function lensLayout() {

    let Client_Width = $('.lens_content')[0].clientWidth;

    for(let i = 0; i < 100; i++) {

        let randomNum = Math.random() * (50 - 10) + 10;
        randomNum = Math.floor(randomNum)

        $('#area_lens_content').html(
            $('#area_lens_content').html()
            + '<p class="lens_content" style="grid-row-end:' + `span ${randomNum}` + '">' + randomNum + '</p>'
        );
    }
}

// <p class="lens_content">1</p>