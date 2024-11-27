/* 
    File: Page404.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/General/Page404.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/


export const SeeChen_Pages404 = {

    init: async () => {

        await SeeChen_Pages404.render();
        SeeChen_Pages404.registerEvents();
    },

    render: async () => {

        var page404PageLayout = await window.myTools.getJson("/Layout/Webpages/General/Page404.json");

        const suggestionPath = SeeChen_Pages404_Suggestion.findClosestRoutes(window.location.pathname);

        if (window.location.pathname.includes("travel")) {
            page404PageLayout.children[1].children[0].children[0].children = ["_location_not_found_"];
        }

        for (let i = 0; i < 3; i++) {
            page404PageLayout.children[1].children[0].children.push({
                tag: "div",
                props: {},
                lang: "",
                children: [{
                    tag: "p",
                    props: {},
                    lang: "",
                    children: []
                }, {
                    tag: "p",
                    props: {
                        class: "suggestion_link",
                        onclick: `window.router.route("${suggestionPath[i]["route"]}")`
                    },
                    lang: "",
                    children: [`${window.location.origin}${suggestionPath[i]["route"]}`]
                }]
            });
        }

        window.globalValues.currentVDom = page404PageLayout;
         
        document.querySelector("#box_contentArea").appendChild(
            window.vDom.Render(
                page404PageLayout
            )
        );
    },

    registerEvents: () => {

    },

    clearUp: () => {

        document.querySelector("#contentArea").scrollTo(0, 0);

        const boxContent = document.querySelector("#box_contentArea");
        const Pages404Content = boxContent.querySelector("#box_404Pages");
        Pages404Content.style.opacity = 0;

        setTimeout(() => {
            boxContent.removeChild(Pages404Content);
        }, 1000);
    }
}

const SeeChen_Pages404_Suggestion = {

    levenshteinDistance: (
        a, 
        b
    ) => {

        const matrix = Array.from({
            length: a.length + 1 
        }, (
            _, 
            i
        ) =>
            Array(b.length + 1).fill(i === 0 ? 0 : i)
        );
    
        for (let j = 1; j <= b.length; j++) {
            matrix[0][j] = j;
        }
    
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                if (a[i - 1] === b[j - 1]) {

                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {

                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + 1
                    );
                }
            }
        }

        return matrix[a.length][b.length];
    },
    
    findClosestRoutes: (
        inputRoute
    ) => {

        const similarities = window.globalValues.validRoutes.map((route) => ({
            route,
            distance: SeeChen_Pages404_Suggestion.levenshteinDistance(inputRoute, route),
        }));
    
        similarities.sort((a, b) => a.distance - b.distance);

        return similarities;
    }
}
