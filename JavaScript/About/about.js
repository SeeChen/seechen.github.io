/* 
    File: about.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/About/about.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/

export const SeeChen_AboutPage = {

    init: async () => {

        await SeeChen_AboutPage.render();
        SeeChen_AboutPage.registerEvents();
        document.querySelector("#box_AboutPage").style.opacity = 1;
    },

    render: async () => {

        const allContent = document.querySelectorAll(".session_Content");
        allContent.forEach(ele => {

            console.log(ele);

            if (ele.scrollHeight > ele.clientHeight) {

                console.log('expand');
            }
        });
    },

    registerEvents: () => {


    },

    clearUp: () => {

    }
}
