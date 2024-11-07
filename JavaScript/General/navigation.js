
import { route } from "./route.js";
import { vNodeCreate, vNodeRender } from "./VirtualDOM.js";

export function renderNavigation() {

    const navigationContent = window.globalValues.translateData.navigation[window.globalValues.language];
    console.log(navigationContent);

    let domNav = vNodeCreate("div", {}, [

        vNodeCreate("p", {}, [window.globalValues.translateData.index[window.globalValues.language]._title_]),

        vNodeCreate("ul", {}, [
            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/')",
                class: "selected"
            }, [navigationContent._home_]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/travel')",
            }, [navigationContent._travel_]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/lens')",
            }, [navigationContent._lens_]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/projects')",
            }, [navigationContent._projects_]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/about')",
            }, [navigationContent._about_]),
        ]),
    ]);

    document.getElementById("box_navBar").appendChild(vNodeRender(domNav));
}

export function navigationMenuClick(obj, path) {

    document.querySelector(".selected").classList.remove("selected");
    obj.classList.add("selected");

    route(path);
}

export function navigationMenuExpand(obj) {
    
    obj.classList.toggle("nav_MenuClick");
    document.querySelector("#box_navBar").classList.toggle("nav_MenuExpand");
}
