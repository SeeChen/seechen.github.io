
export const SeeChen_Navigation = {

    init: async () => {

        await SeeChen_Navigation.render();
        SeeChen_Navigation.registerEvents();
    },

    render: async () => {

        var navPageLayout = await window.myTools.getJson("/Layout/Webpages/General/Navigation.json");

        document.querySelector("#box_navBar").appendChild(
            window.vDom.Render(
                window.vDom.Create(navPageLayout)
            )
        );
    },

    registerEvents: () => {

        window.eventBus.on(
            "scrollEvent",
            nav_Scroll
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

const nav_Scroll = (
    scrollEvent
) => {

    var navBar = document.querySelector("#box_navBar");
    var contentArea = document.querySelector("#contentArea");
    var footerArea = document.querySelector("#box_footerArea");

    var target_scrollTop = scrollEvent.target.scrollTop; 
    var body_clientHeight = document.querySelector("body").clientHeight;
    var p_clientHeight = document.querySelector("#box_navBar div p").clientHeight;
    var footer_rectTop = footerArea.getBoundingClientRect().top;

    if (target_scrollTop >= p_clientHeight) {
        navBar.classList.add("navShow");
        document.documentElement.style.setProperty(
            "--home-section-second-title-top", 
            `${document.querySelector(".home_SectionTitle").clientHeight
                 + p_clientHeight + 5}px`
        );
        document.documentElement.style.setProperty(
            "--home-section-title-top", 
            `${p_clientHeight}px`
        );
    } else if (target_scrollTop <= p_clientHeight) {
        navBar.classList.remove("navShow");
    }

    if (target_scrollTop >= body_clientHeight) {
        contentArea.classList.remove("scrollBarNotDisplay");
    } else if (target_scrollTop <= body_clientHeight) {
        contentArea.classList.add("scrollBarNotDisplay");
    }


    if (footer_rectTop < p_clientHeight) {
        navBar.style.top = `-${p_clientHeight - footer_rectTop + 5}px`;
    } else {
        navBar.style.top = "";
    }

    if (footer_rectTop <= (body_clientHeight / 1.25)) {
        footerArea.classList.remove("notInDisplay");
    } else if (footer_rectTop > (body_clientHeight / 1.25)) {
        footerArea.classList.add("notInDisplay");
    }
}
