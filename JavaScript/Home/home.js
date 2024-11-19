
export const SeeChen_HomePage = {

    init: async () => {

        await SeeChen_HomePage.render();
        SeeChen_HomePage.registerEvents();
    },

    render: async () => {

        var homePageLayout = await window.myTools.getJson("/Layout/Webpages/Home/Home.json");
        var homePageDom = window.vDom.Create(homePageLayout, {
            home: window.globalValues.translateData.home[window.globalValues.language],
            month: window.globalValues.translateData.month[window.globalValues.language]
        });

        var homeTimeline = await window.myTools.getJson("/Layout/Webpages/Home/Timeline.json");        
        let homeTimeline_Year = Object.keys(homeTimeline).filter(item => item != "title");

        homePageDom.children[4].children.push(
            window.vDom.Create(
                {
                    tag: "p",
                    props: {
                        class: "home_toSticky home_SectionTitle home_ContentSectionAnimation"
                    },
                    lang: "timeline",
                    children: [homeTimeline.title]
                }
            )
        )

        for (const year of homeTimeline_Year) {

            const data_Year = homeTimeline[year];
            let homeTimeline_Month = Object.keys(data_Year);

            let timeline_Layout = {
                tag: "div",
                props: {
                    style: "position: relative;"
                },
                lang: "",
                children: [{
                    tag: "p",
                    props: {
                        class: "home_toSticky home_SectionSecondTitle"
                    },
                    lang: "",
                    children: [year]
                }]
            }

            let month_index = 0;
            for (const month of homeTimeline_Month) {

                month_index += 1;
                const data_Month = data_Year[month];
                let homeTimeline_Day = Object.keys(data_Month);

                timeline_Layout.children.push({
                    tag: "div",
                    props: {
                        style: "position: relative;"
                    },
                    lang: "",
                    children: [{
                        tag: "p",
                        props: {
                            class: "home_toSticky home_SectionSecondTitle home_SectionSecondTitle2"
                        },
                        lang: "month",
                        children: [month]
                    }]
                });

                for (const day of homeTimeline_Day) {

                    const day_Data = data_Month[day];
                    day_Data.forEach(item => {

                        timeline_Layout.children[month_index].children.push({
                            tag: "div",
                            props: {
                                class: "home_Timeline_Content"
                            },
                            lang: "",
                            children: [{
                                tag: "p",
                                props: {
                                    class: "day"
                                },
                                lang: "",
                                children: [day.replace("d", "")]
                            }, {
                                tag: "img",
                                props: {
                                    src: item.src,
                                    alt: item.alt,
                                    loading: "lazy"
                                },
                                lang: "",
                                children: []
                            }, {
                                tag: "p",
                                props: {
                                    class: "description"
                                },
                                lang: "timeline",
                                children: [item.alt]
                            }]
                        });
                    });
                }
            }

            homePageDom.children[4].children.push(
                window.vDom.Create(timeline_Layout)
            );
        }

        window.globalValues.currentVDom = homePageDom;
         
        document.querySelector("#box_contentArea").appendChild(
            window.vDom.Render(
                homePageDom
            )
        );
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
        );

        document.querySelector("#contentArea").scrollTo(0, 0);

        const boxContent = document.querySelector("#box_contentArea");
        const homeContent = boxContent.querySelector("#box_HomePage");
        homeContent.style.opacity = 0;

        setTimeout(() => {
            boxContent.removeChild(homeContent);
        }, 1000);
    }
}

const home_Scroll = (
    scrollEvent
) => {

    const home_SectionTitleTag = document.querySelectorAll(".home_toSticky");
    home_SectionTitleTag.forEach(target => {
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

    const home_Month = document.querySelectorAll(".home_SectionSecondTitle2");
    home_Month.forEach(target => {
        const rect = target.getBoundingClientRect();
        if (`${rect.top}` <= parseInt(document.documentElement.style.getPropertyValue("--home-section-second-title-top"))) {
            target.classList.add("home_ContentSectionTitle2_Month");
        } else {    
            target.classList.remove("home_ContentSectionTitle2_Month");
        }
    });
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
