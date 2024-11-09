
export const SeeChen_HomePage = {

    render: async () => {

        console.log("Home Page Render.");
        var homePageLayout = await window.myTools.getJson("/Layout/Webpages/Home/Home.json");
        console.log(homePageLayout);
    },

    home_Scroll: (x) => {
        console.log(x);
    },

    registerEvents: () => {

        window.eventBus.on(
            "scrollEvent",
            home_Scroll
        );
    },

    clearUp: () => {
        
        window.eventBus.off(
            "scrollEvent",
            home_Scroll
        )
    }
}

const home_Scroll = (
    scrollEvent
) => {

    const home_SectionTitleTag = document.querySelectorAll(".home_toSticky");
}


export function homeScroll() {

    const homeContent = document.querySelector("#contentArea");
    homeContent.addEventListener("scroll", function(event) {

        const homeSectionTitleTag = document.querySelectorAll(".home_toSticky");
        homeSectionTitleTag.forEach(target => {
            const rect = target.getBoundingClientRect();
            const isInViewport = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
            if (isInViewport) {

                if (rect.top <= (document.querySelector("body").clientHeight / 3)) {
                    target.classList.remove("home_ContentSectionAnimation");
                    target.classList.add("home_SectionTitle_Sticky");
                } else {
                    target.classList.add("home_ContentSectionAnimation");
                    target.classList.remove("home_SectionTitle_Sticky");
                }
            }
        });

        const homeMonth = document.querySelectorAll(".home_SectionSecondTitle2");
        homeMonth.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (`${rect.top}` <= parseInt(document.documentElement.style.getPropertyValue("--home-section-second-title-top"))) {
                target.classList.add("home_ContentSectionTitle2_Month");
            } else {    
                target.classList.remove("home_ContentSectionTitle2_Month");
            }
        });
    });
}
