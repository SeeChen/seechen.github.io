/* 
    File: services.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/Services/services.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/

export const SeeChen_ServicesPages = {

    init: async () => {

        await SeeChen_ServicesPages.render();
        SeeChen_ServicesPages.registerEvents();

        document.querySelector("#box_ServicesPage").style.opacity = 1;
    },

    render: async () => {

        var servicesPageLayout = await window.myTools.getJson("/Layout/Webpages/Services/Services.json");

        window.globalValues.currentVDom = servicesPageLayout;
         
        document.querySelector("#box_contentArea").appendChild(
            window.vDom.Render(
                servicesPageLayout
            )
        );

        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(
            `#services_Content_7 > #services_Content_7_title::before {
                content: "${window.globalValues.translateData.services[window.globalValues.language]._web_development_}";
            }
            `,
            styleSheet.cssRules.length
        );
        styleSheet.insertRule(
            `#services_Content_8 > #services_Content_8_BackEnd > div > div:nth-child(2) > div:first-child > p:nth-child(3) span:nth-child(1)::before {
                content: "${window.globalValues.translateData.services[window.globalValues.language]._backend_end_3_1_}";
            }
            `,
            styleSheet.cssRules.length
        );
        styleSheet.insertRule(
            `#services_Content_8 > #services_Content_8_BackEnd > div > div:nth-child(2) > div:first-child > p:nth-child(3) span:nth-child(2)::before {
                content: "${window.globalValues.translateData.services[window.globalValues.language]._backend_end_3_2_}";
            }
            `,
            styleSheet.cssRules.length
        );
        styleSheet.insertRule(
            `#services_Content_8 > #services_Content_8_BackEnd > div > div:nth-child(2) > div:first-child > p:nth-child(3) span:nth-child(3)::before {
                content: "${window.globalValues.translateData.services[window.globalValues.language]._backend_end_3_3_}";
            }
            `,
            styleSheet.cssRules.length
        );
    },

    registerEvents: () => {

    },

    clearUp: () => {

        document.querySelector("#contentArea").scrollTo(0, 0);

        const boxContent = document.querySelector("#box_contentArea");
        const servicesContent = boxContent.querySelector("#box_ServicesPage");
        servicesContent.style.opacity = 0;

        setTimeout(() => {
            boxContent.removeChild(servicesContent);
        }, 1000);
    }
}