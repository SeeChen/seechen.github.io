
export function homeScroll() {

    const homeContent = document.querySelector("#contentArea");
    console.log(homeContent);
    homeContent.addEventListener("scroll", function(event) {

        const homeSectionTitleTag = document.querySelectorAll(".home_SectionTitle");
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

        if (event.target.scrollTop >= document.querySelector("#box_navBar div p").clientHeight) {
            document.querySelector("#box_navBar").classList.add("navShow");
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

// export function homeSectionTitlePosition() {

//     const homeSectionTitleTag = document.querySelectorAll(".home_ContentSectionAnimation");
    
//     const intersectionObserver = new IntersectionObserver((entries, observer) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 trackPosition(entry.target);
//             } else {
//                 stopTrackingPosition(entry.target);
//             }
//         });
//     }, {
//         threshold: 0.2
//     });

//     homeSectionTitleTag.forEach(target => {
//         intersectionObserver.observe(target);
//     });

//     const homeSectionPosition = new Map();
//     function trackPosition(element) {
    
//         if (homeSectionPosition.has(element)) return;
    
//         function updatePosition() {
    
//             const rect = element.getBoundingClientRect();
//             console.log(element);
//             console.log(`Element ${element} Position -> Top: ${rect.top}, Left: ${rect.left}`);
    
//             if (element.isConnected) {
//                 homeSectionPosition.set(element, requestAnimationFrame(updatePosition));
//             }
//         }
    
//         homeSectionPosition.set(element, requestAnimationFrame(updatePosition));
//     }
    
//     function stopTrackingPosition(element) {
//         if (homeSectionPosition.has(element)) {
//             cancelAnimationFrame(homeSectionPosition.get(element));
//             homeSectionPosition.delete(element);
//         }
//     }
// }