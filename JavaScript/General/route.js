
window.addEventListener("popstate", () => {

    console.log(window.location.href);
});

const routes = {

    "/": function() {

        document.title = "HOME";
    },

    "/test": function() {

        document.title = "TEST";
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