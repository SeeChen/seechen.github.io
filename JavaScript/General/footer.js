
export const SeeChen_Footer = {

    render: async () => {

        var footerLayout = await window.myTools.getJson("/Layout/Webpages/General/Footer.json");

        document.querySelector("#box_footerArea").appendChild(
            window.vDom.Render(
                window.vDom.Create(footerLayout)
            )
        );
    },

    clearUp: () => {

        // Never
    }
}