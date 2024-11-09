
export const SeeChen_Footer = {

    render: async () => {

        var footerLayout = await window.myTools.getJson("/Layout/Webpages/General/Footer.json");

        document.querySelector("#box_footerArea").appendChild(
            window.vDom.Render(
                window.vDom.Create(footerLayout, {
                    nav: window.globalValues.translateData.navigation[window.globalValues.language],
                    idx: window.globalValues.translateData.index[window.globalValues.language],
                    footer: window.globalValues.translateData.footer[window.globalValues.language]
                })
            )
        );
    },

    clearUp: () => {

        // Never
    }
}