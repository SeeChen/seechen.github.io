
export const SeeChen_HomePage = {

    render: () => {

        console.log("Home Page Render.");
    },

    clearUp: () => {
        
        // Clear Up memory.
    }
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

        if (event.target.scrollTop >= document.querySelector("#box_navBar div p").clientHeight) {
            document.querySelector("#box_navBar").classList.add("navShow");
            document.documentElement.style.setProperty(
                "--home-section-second-title-top", 
                `${document.querySelector(".home_SectionTitle").clientHeight
                     + document.querySelector("#box_navBar div p").clientHeight
                    + 5}px`
            );
            document.documentElement.style.setProperty(
                "--home-section-title-top", 
                `${document.querySelector("#box_navBar div p").clientHeight}px`
            );
        } else if (event.target.scrollTop <= document.querySelector("#box_navBar div p").clientHeight) {
            document.querySelector("#box_navBar").classList.remove("navShow");
        }
        
        if (event.target.scrollTop >= document.querySelector("body").clientHeight) {
            this.classList.remove("scrollBarNotDisplay");
        } else if (event.target.scrollTop <= document.querySelector("body").clientHeight) {
            this.classList.add("scrollBarNotDisplay");
        }
    });
}
