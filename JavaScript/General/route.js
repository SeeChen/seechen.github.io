/* 
    File: route.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/General/route.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/

import { SeeChen_AboutPage } from "../About/about.js";
import { SeeChen_HomePage } from "../Home/home.js";
import { SeeChen_LensPages } from "../Lens/lens.js";
import { SeeChen_ProjectsPage } from "../Projects/projects.js";
import { SeeChen_ServicesPages } from "../Services/services.js";
import { SeeChen_TravelPage } from "../Travel/travel.js";
import { SeeChen_Pages404 } from "./Page404.js";

window.addEventListener("popstate", () => {
    router.route(window.location.pathname);
});

const myFunction = {

    jump: async (
        SeeChen_CurrentPage
    ) => {

        if (SeeChen_CurrentPage !== window.webpages.currentPages) {

            if (Object.keys(window.webpages.currentPages).length !== 0) {

                window.webpages.currentPages.clearUp();

                document.querySelector("#nav_Menu").classList.remove("nav_MenuClick");
                document.querySelector("#box_navBar").classList.remove("navShow", "nav_MenuExpand");
            } 
            window.webpages.currentPages = SeeChen_CurrentPage;

            await window.webpages.currentPages.init();
        }
    },

    Page404: async () => {
        document.title = "404 | SEECHEN";

        if (Object.keys(window.webpages.currentPages).length !== 0) {

            window.webpages.currentPages.clearUp();
            
            document.querySelector("#nav_Menu").classList.remove("nav_MenuClick");
            document.querySelector("#box_navBar").classList.remove("navShow", "nav_MenuExpand");
        }

        window.webpages.currentPages = SeeChen_Pages404;

        await window.webpages.currentPages.init();
    },

    travelIsValid: async (

        countryId,
        proviceId = "NOPE"
    ) => {

        let isTraveledCountry = {
            CN: [
                "BeiJing",
                // "AuHui",
                "ChongQing",
                "FuJian",
                "GuangDong",
                // "GanSu",
                "GuangXi",
                "GuiZhou",
                // "HaiNan",
                "HeBei",
                "HeNan",
                "HongKong",
                // "HeiLongJiang",
                "HuNan",
                "HuBei",
                // "JiLing",
                "JiangSu",
                "JiangXi",
                // "LiaoNing",
                "Macau",
                "InnerMongolia",
                "NingXia",
                // "QingHai",
                "ShaanXi",
                "SiChuan",
                "ShanDong",
                "ShangHai",
                "ShanXi",
                "TianJin",
                // "TaiWan",
                // "XinJiang",
                // "Tibet",
                "YunNan",
                "ZheJiang"
            ],

            MY: [
                "Johor",
                // "Kedah",
                // "Kelantan",
                // "Melaka",
                // "Sembilan",
                // "Pahang",
                "Pinang",
                // "Perak",
                // "Perlis",
                "Selangor",
                // "Terengganu",
                // "Sabah",
                // "Sarawak",
                "KL",
                "Labuan",
                // "Putrajaya"
            ],

            SG: [
                "Central",
                "NorthEast",
                "NorthWest",
                "SouthEast",
                "SouthWest"
            ]
        }

        const CountryArr = Object.keys(isTraveledCountry);

        CountryArr.forEach(_country => {
            window.globalValues.validRoutes.push[`/travel/${_country}`];
        })
        
        if (!CountryArr.includes(countryId)) {

            return false;
        }

        if (proviceId !== "NOPE" && !isTraveledCountry[countryId].includes(proviceId)) {

            isTraveledCountry[countryId].forEach(_provice => {
                window.globalValues.validRoutes.push[`/travel/${countryId}/${_provice}`];
            })
            return false;
        }

        return true;
    }
}

const routesFunction = {

    home: async () => {

        document.title = `${window.globalValues.translateData.nav[window.globalValues.language]._home_} | SEECHEN`;
        await myFunction.jump(SeeChen_HomePage);
    },

    travel: async () => {

        document.title = `${window.globalValues.translateData.nav[window.globalValues.language]._travel_} | SEECHEN`;
        await myFunction.jump(SeeChen_TravelPage);
    },

    lens: async () => {

        document.title = `${window.globalValues.translateData.nav[window.globalValues.language]._lens_} | SEECHEN`;
        await myFunction.jump(SeeChen_LensPages);
    },

    services: async () => {
        document.title = `${window.globalValues.translateData.nav[window.globalValues.language]._services_} | SEECHEN`;
        await myFunction.jump(SeeChen_ServicesPages);
    },

    projects: async () => {
        document.title = `${window.globalValues.translateData.nav[window.globalValues.language]._projects_} | SEECHEN`;
        await myFunction.jump(SeeChen_ProjectsPage);
    },

    about: async () => {
        document.title = `${window.globalValues.translateData.nav[window.globalValues.language]._about_} | SEECHEN`;
        await myFunction.jump(SeeChen_AboutPage);
    }

}

const routes = {

    "/": async () => {
        await routesFunction.home();
    },

    "/travel": async () => {
        window.myData.travel.isCountry = false;
        window.myData.travel.isProvice = false;
        await routesFunction.travel();
    },
    "/travel/": async () => {
        window.myData.travel.isCountry = false;
        window.myData.travel.isProvice = false;
        await routesFunction.travel();
    },
    "/%E6%97%85%E8%A1%8C": async () => {
        window.myData.travel.isCountry = false;
        window.myData.travel.isProvice = false;
        await routesFunction.travel();
    },
    "/travel/:countryId": async (
        params
    ) => {

        const { countryId } = params;

        if (!(await myFunction.travelIsValid(countryId))) {

            window.myData.travel.isCountry = false;
            window.myData.travel.isProvice = false;
            await myFunction.Page404();
            return;
        } else {

            window.myData.travelpathParams = params;
            window.myData.travel.isCountry = true;
            window.myData.travel.isProvice = false;
            await routesFunction.travel();
        }
    },
    "/travel/:countryId/:proviceId": async (
        params
    ) => {
        const { countryId, proviceId } = params;

        if (!(await myFunction.travelIsValid(countryId, proviceId))) {

            window.myData.travel.isCountry = false;
            window.myData.travel.isProvice = false;
            await myFunction.Page404();
            return;
        } else {

            window.myData.travelpathParams = params;
            window.myData.travel.isCountry = true;
            window.myData.travel.isProvice = true;
            await routesFunction.travel();
        }
    },

    "/lens": async () => {
        await routesFunction.lens();
    },
    "/lens/": async () => {
        await routesFunction.lens();
    },

    "/services": async () => {
        await routesFunction.services();
    },
    "/services/": async () => {
        await routesFunction.services();
    },

    "/projects": async () => {
        await routesFunction.projects();
    },
    "/about": async () => {
        await routesFunction.about();
    },
}

export const router = {

    route: async (
        path,
        executed = true
    ) => {
        
        const routeMatch = router.matchRoute(path);
        window.history.pushState({}, path, window.location.origin + path);

        if (!executed) {
            return;
        }

        if (routeMatch) {
            const params = routeMatch.params;
            await routeMatch.handler(params);
        } else {
            await myFunction.Page404();
        }
    },

    matchRoute: (
        path
    ) => {

        const mappingArray = [
            {
                keys: [
                    "/",
                    "/spa",
                    "/spa.htm",
                    "/spa.html",
                    "/index",
                    "/index.htm",
                    "/index.html",
                    "/home",
                    "/home.htm",
                    "/home.html",
                ],

                values: "/"
            }, {
                keys: [
                    "/projects",
                    "/projects.htm",
                    "/projects.html",
                    "/Projects",
                    "/Projects.htm",
                    "/Projects.html",
                    "/%E9%A1%B9%E7%9B%AE",
                    "/%E6%88%91%E7%9A%84%E9%A1%B9%E7%9B%AE"
                ],

                values: "/projects"
            }, {
                keys: [
                    "/About",
                    "/About.htm",
                    "/About.html",
                    "/about",
                    "/about.htm",
                    "/about.html",
                    "/%E5%85%B3%E4%BA%8E"
                ],

                values: "/about"
            }
        ]

        for (const map of mappingArray) {
            if (map.keys.includes(path)) {
                path = map.values;
            }
        }

        for (const route in routes) {
            const routeRegex = router.pathToRegex(route);
            const match = path.match(routeRegex);
            
            if (match) {
                return {
                    handler: async (params) => { await routes[route](params); },
                    params: router.extractParams(route, match)
                };
            }
        }
        return null;
    },

    pathToRegex: (
        route
    ) => {

        const keys = [];
        const regex = route.replace(/:([a-zA-Z]+)/g, (full, key) => {
            keys.push(key);
            return "([^/]+)";
        });
        return new RegExp(`^${regex}$`);
    },

    extractParams: (
        route,
        match
    ) => {
        const keys = [];
        route.replace(/:([a-zA-Z]+)/g, (full, key) => {
            keys.push(key);
        });
        const params = {};
        keys.forEach((key, index) => {
            params[key] = match[index + 1];
        });
        return params;
    }
}
