
export const SeeChen_TravelPage = {

    init: async () => {

        const obj_Maps = document.querySelectorAll("object");

        obj_Maps.forEach(obj => {

            obj.contentDocument.querySelectorAll(".visited").forEach(element => {

                element.addEventListener("mouseenter", (e) => {
                    window.eventBus.emit("mapsMouseEnter", {e, element, baseID: obj.id});
                });

                element.addEventListener("mouseout", (e) => {
                    window.eventBus.emit("mapsMouseOut", {e, element, baseID: obj.id});
                });

                element.addEventListener("click", (e) => {
                    window.eventBus.emit("mapsClick", { e, element, baseID: obj.id, obj });
                });
            });
        });

        document.querySelector("#travel_TraveledList").addEventListener("scroll", (e) => {
            window.eventBus.emit("traveledScroll", { e });
        });

        document.querySelector("#travel_btn_MapsBack").addEventListener("click", (e) => {
            window.eventBus.emit("travelMapsBtnClick", { e });
        });

        document.querySelector("#travel_CountryMapsBox").classList.add("MapCountryHide");
        document.querySelectorAll("#travel_CountryMapsBox object").forEach(obj => {

            obj.classList.add("MapIsHide");
        });
    },

    render: async () => {

        
    },

    registerEvents: () => {

        const travel_EventHandler = {
            
            scrollEvent: travel_Scroll,
            mapsMouseEnter: travel_MapsMouseEnter,
            mapsMouseOut: travel_MapsMouseOut,
            mapsClick: travel_MapsClick,

            travelMapsBtnClick: travel_MapsBtnClick,

            traveledScroll: traveled_Scroll
        }

        Object.entries(travel_EventHandler).forEach(([event, handler]) => {

            window.eventBus.on(event, handler);
        });
    },

    clearUp: () => {

        const travel_EventHandler = {
            
            scrollEvent: travel_Scroll,
            mapsMouseEnter: travel_MapsMouseEnter,
            mapsMouseOut: travel_MapsMouseOut,

            traveledScroll: traveled_Scroll
        }

        Object.entries(travel_EventHandler).forEach(([event, handler]) => {

            window.eventBus.off(event, handler);
        });

        const boxContent = document.querySelector("#box_contentArea");
        const travelContent = boxContent.querySelector("#box_TravelPage");
        travelContent.style.opacity = 0;

        setTimeout(() => {
            boxContent.removeChild(travelContent);
        }, 1000);
    }
}

const travel_Scroll = (
    scrollEvent
) => {

}

const traveled_Scroll = (
    scrollEvent
) => {

    const { e } = scrollEvent;
    
    const traveled_TraveledList = document.querySelector("#travel_TraveledList");

    traveled_TraveledList.classList.remove("at_left", "at_right");
    if (e.target.scrollLeft === 0) {
        traveled_TraveledList.classList.add("at_left");
    } else if (traveled_TraveledList.scrollWidth <= 1.1 * (traveled_TraveledList.scrollLeft + traveled_TraveledList.clientWidth)) {

        traveled_TraveledList.classList.add("at_right");
    }
}

const travel_MapsMouseEnter = (
    hoverEvent
) => {

    const { e, element, baseID } = hoverEvent;
    travel_ChangeAreaName(baseID, element.id);
}

const travel_MapsMouseOut = (
    hoverEvent
) => {

    const { e, element, baseID } = hoverEvent;

    travel_ChangeAreaName(baseID, baseID.split("_")[1].toUpperCase());
}

const travel_MapsClick = (
    clickEvent
) => {

    const { e, element, baseID, obj } = clickEvent;

    sessionStorage.setItem("WorldMapsScrollLeft", document.querySelector("#travel_MapsBox").scrollLeft);
    
    obj.classList.add("WorldMapsHide");
    document.querySelector(`#travel_CountryMapsBox`).classList.remove("MapCountryHide");
    document.querySelector(`#Maps_${element.id}`).classList.add("MapIsShow");

    let current_rect = element.getBoundingClientRect();
    let rect_2 = obj.getBoundingClientRect();

    var worldPosition = {
        'top': 0,
        'left': 0,
        'width': 0,
        'height': 0
    }

    worldPosition['width'] = current_rect.width;
    worldPosition['height'] = current_rect.height;
    worldPosition['top'] = current_rect.top + rect_2.top;
    worldPosition['left'] = current_rect.left + rect_2.left;

    document.documentElement.style.setProperty("--travel-before-scale-height", `${worldPosition["height"]}px`);
    document.documentElement.style.setProperty("--travel-before-scale-width", `${worldPosition["width"]}px`);
    document.documentElement.style.setProperty("--travel-before-scale-top", `${worldPosition["top"]}px`);
    document.documentElement.style.setProperty("--travel-before-scale-left", `${worldPosition["left"]}px`);

    setTimeout(() => {

        document.querySelector(`#travel_CountryMapsBox`).classList.add("withAnimation");
        document.querySelector(`#travel_CountryMapsBox`).classList.add("afterScale");
        setTimeout(() => {
            
            obj.classList.add("WorldMapsHideDisplay");
            document.querySelector("#travel_btn_MapsBack").classList.remove("btn_Hide");
        }, 500);
    }, 500);
}

const travel_MapsBtnClick = (
    clickEvent
) => {

    const { e } = clickEvent;

    document.querySelector(`#travel_CountryMapsBox`).classList.remove("afterScale");
    document.querySelector("#Map_World").classList.remove("WorldMapsHideDisplay");
    document.querySelector("#travel_MapsBox").scrollLeft = sessionStorage.getItem("WorldMapsScrollLeft");
    document.querySelector("#travel_btn_MapsBack").classList.add("btn_Hide");

    setTimeout(() => {

        document.querySelector("#Map_World").classList.remove("WorldMapsHide");
        
        setTimeout(() => {
            document.querySelector(`#travel_CountryMapsBox`).classList.remove("withAnimation");
            document.querySelector(`#travel_CountryMapsBox`).classList.add("MapCountryHide");

            document.querySelector(`.MapIsShow`).classList.remove("MapIsShow");
        }, 500);
    }, 1000);
}

const travel_ChangeAreaName = (
    baseID,
    areaID
) => {

    baseID = baseID.split("_")[1].toUpperCase();
    let areaName = 
        window.globalValues.translateData.country[window.globalValues.language][areaID] ||
        window.globalValues.translateData[`country${baseID}`][[window.globalValues.language]][areaID];

    document.querySelector(".p_AreaName:not(.areaNameDisplay)").innerText = areaName;
    document.querySelectorAll(".p_AreaName").forEach(el => {
        el.classList.toggle("areaNameDisplay");
    });
}
