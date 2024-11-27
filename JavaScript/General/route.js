/* 
    File: route.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/General/route.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/

import { SeeChen_HomePage } from "../Home/home.js";
import { SeeChen_LensPages } from "../Lens/lens.js";
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
    }

}

const routes = {

    "/": async () => {
        await routesFunction.home();
    },
    "/spa": async () => {
        await routesFunction.home();
    },
    "/spa/": async () => {
        await routesFunction.home();
    },
    "/spa.html": async () => {
        await routesFunction.home();
    },
    "/index": async () => {
        await routesFunction.home();
    },
    "/index/": async () => {
        await routesFunction.home();
    },
    "/index.html": async () => {
        await routesFunction.home();
    },
    "/home": async () => {
        await routesFunction.home();
    },
    "/home/": async () => {
        await routesFunction.home();
    },
    "/home.html": async () => {
        await routesFunction.home();
    },

    "/travel": async () => {
        await routesFunction.travel();
    },
    "/travel/": async () => {
        await routesFunction.travel();
    },
    "/travel/:countryId": async (
        params
    ) => {

        const { countryId } = params;

        if (!myFunction.travelIsValid(countryId)) {

            if (countryId === "TW") {
                await router.route("/travel/CN/TaiWan", true);
                return;
            }

            await myFunction.Page404();
            return;
        }

        window.myData.travelpathParams = params;
        window.myData.travel.isCountry = true;
        await routesFunction.travel();
    },
    "/travel/:countryId/:proviceId": async (
        params
    ) => {
        const { countryId, proviceId } = params;

        if (!myFunction.travelIsValid(countryId, proviceId)) {

            await myFunction.Page404();
            return;
        }

        window.myData.travelpathParams = params;
        window.myData.travel.isCountry = true;
        window.myData.travel.isProvice = true;
        await routesFunction.travel();
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

    },
    "/about": async () => {

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
