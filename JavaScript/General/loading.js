
import { deepCopy } from "./deepCopy.js";
import { vNodeCreate, vNodeRender, vNodeDiff, vNodePatch } from "./VirtualDOM.js";

export function initLoading() {
    return vNodeCreate("div", {}, [
        vNodeCreate("p", {}, [window.location.host]),
        vNodeCreate("ol", {
            start: "0"
        }, [
            vNodeCreate("li", {
                class: "waiting_to_insert"
            }, ["Hello World!"]),

            vNodeCreate("p", {
                id: "progressBar"
            }, ["0%"]),
        ]),
    ]);
}

export function loadingMessage(boxLoading, loadingContent, message, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            var oldLoadingContent = deepCopy(loadingContent);
            delete loadingContent.children[1].children.slice(-2)[0].props.class;
            loadingContent.children[1].children.splice(-1, 0, vNodeCreate("li", {
                class: "waiting_to_insert"
            }, [message]));
            vNodePatch(boxLoading, vNodeDiff(oldLoadingContent, loadingContent));
            resolve(loadingContent);
        }, delay);
    });
}

export function updateProgress(progress) {
    document.getElementById("progressBar").innerText = progress;
}

export async function pageLoading() {

    const boxLoading = document.getElementById("box_loading");

    var loadingContent = initLoading();
    boxLoading.appendChild(vNodeRender(loadingContent));

    const message = [
        "你好，世界！",
        "",
        "Loading ...",
        "加载中 。。。",
        "0%"
    ];
    for (const msg of message) {
        loadingContent = await loadingMessage(boxLoading, loadingContent, msg, 500);
    }

    updateProgress("10%");
}

export function pageLoaded() {

    const boxLoading = document.getElementById("box_loading");
    const childLoading = boxLoading.querySelector("div");
    updateProgress("100%");
    boxLoading.classList.add("hide");

    document.querySelector("#box_navBar").classList.remove("navHide");

    setTimeout(() => {
        boxLoading.removeChild(childLoading);
        console.log(window.globalValues.currentVDom);
    }, 1000);
}
