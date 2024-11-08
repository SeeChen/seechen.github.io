
export const SeeChen_Navigation = {

    render: async () => {

        var homePageLayout = await window.myTools.getJson("/Layout/Webpages/General/Navigation.json");

        let LanguageFile = window.globalValues.translateData.navigation[window.globalValues.language];
        LanguageFile["_title_"] = window.globalValues.translateData.index[window.globalValues.language]._title_;
        document.querySelector("#box_navBar").appendChild(
            window.vDom.Render(
                window.vDom.Create(homePageLayout, LanguageFile)
            )
        );
    },

    clearUp: () => {
        
        // Navigation never Clear Up.
        console.log("Never Clearup.");
    }
}

export const SeeChen_Navigation_Click = {

    clickMenu: (
        obj, 
        path
    ) => {

        document.querySelector(".selected").classList.remove("selected");
        obj.classList.add("selected");

        window.router.route(path);
    },

    expandMenu: (
        obj
    ) => {
        obj.classList.toggle("nav_MenuClick");
        document.querySelector("#box_navBar").classList.toggle("nav_MenuExpand");
    }
}
