
window.addEventListener("popstate", () => {
    router.route(window.location.pathname);
});

document.addEventListener("DOMContentLoaded", () => {
    router.route(window.location.pathname);
});

const routes = {

    "/": function () {
        document.title = "HOME";
    },

    "/post/:id": function (params) {
        document.title = `ID: ${params.id}`;
    }
}

export const router = {

    route: (
        path
    ) => {
        const routeMatch = router.matchRoute(path);
    
        if (routeMatch) {
            const params = routeMatch.params;
            routeMatch.handler(params);
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
                    handler: routes[route],
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
