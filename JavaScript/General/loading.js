
export const SeeChen_Loading = {

    init: async () => {
        let loadingLayout = await window.myTools.getJson("/Layout/Webpages/General/Loading.json");
        loadingLayout.children[0].children[0] = window.location.host;
        return vDom.Create(loadingLayout);
    },

    updateProgress: (
        progress
    ) => {
        document.querySelector("#progressBar").innerText = progress;
    },

    pageLoadingMessage: async (
        boxLoading,
        layoutLoading,
        message,
        delay
    ) => {
        return new Promise(resolve => {
            setTimeout(() => {
                var oldLoadingContent = window.myTools.deepCopy(layoutLoading);
                delete layoutLoading.children[1].children.slice(-2)[0].props.class;
                layoutLoading.children[1].children.splice(-1, 0, window.vDom.CreateElement("li", {
                    class: "waiting_to_insert"
                }, 
                "",
                [message]));
                window.vDom.Patch(boxLoading, window.vDom.Diff(oldLoadingContent, layoutLoading));
                resolve(layoutLoading);
            }, delay);
        });
    },

    pageLoading: async () => {

        const boxLoading = document.querySelector("#box_loading");
        var layoutLoading = await SeeChen_Loading.init();

        boxLoading.appendChild(window.vDom.Render(layoutLoading));

        const updateMessage = [
            "你好，世界！",
            "",
            "Loading ...",
            "加载中 。。。",
            "0%"
        ];

        for (const msg of updateMessage) {
            layoutLoading = await SeeChen_Loading.pageLoadingMessage(boxLoading, layoutLoading, msg, 500);
        }

        SeeChen_Loading.updateProgress("10%");
    },

    pageLoaded: () => {

        const boxLoading = document.querySelector("#box_loading");
        const childLoading = boxLoading.querySelector("div");
        SeeChen_Loading.updateProgress("100%");
        boxLoading.classList.add("hide");

        document.querySelector("#box_navBar").classList.remove("navHide");

        setTimeout(() => {
            boxLoading.removeChild(childLoading);
        }, 1000);
    },
}
