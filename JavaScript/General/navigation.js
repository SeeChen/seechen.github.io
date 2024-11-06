
import { route } from "./route.js";
import { vNodeCreate, vNodeRender } from "./VirtualDOM.js";

export function renderNavigation() {

    console.log(window.globalValues.translateData);

    let domNav = vNodeCreate("div", {}, [
        vNodeCreate("p", {}, [window.globalValues.translateData.index[window.globalValues.language]._title_]),

        vNodeCreate("ul", {}, [
            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/')",
                class: "selected"
            }, ["Home"]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/travel')",
            }, ["Travel"]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/lens')",
            }, ["Lens"]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/projects')",
            }, ["Projects"]),

            vNodeCreate("li", {
                onclick: "window.clickEvent.navigationMenuClick(this, '/about')",
            }, ["About"]),
        ]),
    ]);

    window.globalValues.currentVDom = domNav;
    document.getElementById("box_navBar").appendChild(vNodeRender(window.globalValues.currentVDom));
}

export function navigationMenuClick(obj, path) {

    document.querySelector(".selected").classList.remove("selected");
    obj.classList.add("selected");

    route(path);
}