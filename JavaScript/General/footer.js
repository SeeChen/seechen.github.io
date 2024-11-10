
export const SeeChen_Footer = {

    init: async () => {

        await SeeChen_Footer.render();
    },

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