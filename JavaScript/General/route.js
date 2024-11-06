
window.addEventListener("popstate", () => {

    route(window.location.pathname);
});

const routes = {

    "/": function() {

        document.title = "HOME";
    },

    "/home": function() {

        document.title = "home";
    }
}

export function route(path) {

    if (routes[path]) {

        routes[path]();
    } else {

        document.title = "404 Pages Not Found!";
    }

    window.history.pushState({}, path, window.location.origin + path);
}