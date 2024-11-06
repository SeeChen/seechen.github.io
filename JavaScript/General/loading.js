import { vNodeCreate, vNodeRender, vNodeDiff, vNodePatch } from "./VirtualDOM.js";

export function initLoading() {
    return vNodeCreate("div", {}, [
        vNodeCreate("p", {}, [window.location.host]),
        vNodeCreate("ol", {
            start: "0"
        }, [
            vNodeCreate("li", {
                class: "waiting_to_insert"
            }, ["Hello World!"])
        ]),
    ]);
}

export function pageLoading() {

    const boxLoading = document.getElementById("box_loading");

    var loadingContent = initLoading();
    boxLoading.appendChild(vNodeRender(loadingContent));
}

export function pageLoaded() {

    const boxLoading = document.getElementById("box_loading");
    
}