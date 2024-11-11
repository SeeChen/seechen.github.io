import { SeeChen_HomePage } from "../Home/home.js";

window.addEventListener("popstate", () => {
    router.route(window.location.pathname);
});

const routesFunction = {

    home: async () => {

        document.title = "SEECHEN";

        if (SeeChen_HomePage !== window.webpages.currentPages) {

            window.webpages.currentPages = SeeChen_HomePage;
            // await window.webpages.currentPages.init();
        }
    },

}

const routes = {

    "/": async () => {
        await routesFunction.home();
    },
    "/spa.html": async () => {
        await routesFunction.home();
    },
    "/index": async () => {
        await routesFunction.home();
    },
    "/index.html": async () => {
        await routesFunction.home();
    },
    "/home": async () => {
        await routesFunction.home();
    },
    "/home.html": async () => {
        await routesFunction.home();
    },

    "/travel": async () => {
        
    },
    "/lens": async () => {

    },
    "/post": async () => {

    },
    "/projects": async () => {

    },
    "/about": async () => {

    },
}

export const router = {

    route: async (
        path
    ) => {
        const routeMatch = router.matchRoute(path);
    
        if (routeMatch) {
            const params = routeMatch.params;
            await routeMatch.handler(params);
        } else {
            document.title = "404 Page Not Found!";
        }
    
        window.history.pushState({}, path, window.location.origin + path);
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
