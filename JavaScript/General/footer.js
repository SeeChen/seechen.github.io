/* 
    File: footer.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/General/footer.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/


export const SeeChen_Footer = {

    init: async () => {

        await SeeChen_Footer.render();
    },

    render: async () => {

        var footerLayout = await window.myTools.getJson("/Layout/Webpages/General/Footer.json");

        document.querySelector("#box_footerArea").appendChild(
            window.vDom.Render(
                window.vDom.Create(footerLayout)
            )
        );
    },

    clearUp: () => {

        // Never
    }
}