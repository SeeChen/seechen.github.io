
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
    } else if (traveled_TraveledList.scrollWidth <= (traveled_TraveledList.scrollLeft + traveled_TraveledList.clientWidth)) {

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
    travel_ChangeAreaName(baseID, "WORLD");
}

const travel_MapsClick = (
    clickEvent
) => {

    const { e, element, baseID, obj } = clickEvent;
    
    obj.classList.add("WorldMapsHide");
    document.querySelector(`#travel_CountryMapsBox`).classList.remove("MapCountryHide");
    document.querySelector(`#${element.id}_Maps`).classList.add("MapIsShow");

    setTimeout(() => {
        obj.classList.add("WorldMapsHideDisplay");
    }, 1000);
}

const travel_ChangeAreaName = (
    baseID,
    areaID
) => {

    let areaName = "";
    baseID = baseID.split("_")[1];
    if (baseID === "World") {
        areaName = window.globalValues.translateData.country[window.globalValues.language][areaID];
    } else {
        areaName = window.globalValues.translateData[`country${baseID}`][[window.globalValues.language]][areaID];
    }

    document.querySelector(".p_AreaName:not(.areaNameDisplay)").innerText = areaName;
    document.querySelectorAll(".p_AreaName").forEach(el => {
        el.classList.toggle("areaNameDisplay");
    });
}
