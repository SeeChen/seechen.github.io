
export const SeeChen_TravelPage = {

    init: async () => {

        window.myData.travel.TravelList = await window.myTools.getJson("/Data/Travel/TraveledList.json");

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

        document.querySelector("#travel_ContentExpand").addEventListener("click", (e) => {

            document.querySelectorAll("#travel_ContentExpand span").forEach(el => {
                el.classList.toggle("contentExpand");
            });
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
    } else if (traveled_TraveledList.scrollWidth <= 1.05 * (traveled_TraveledList.scrollLeft + traveled_TraveledList.clientWidth)) {

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

const travel_MapsClick_World  = (
    obj,
    element
) => {

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

const travel_UpdateTraveledList = async (
    eleID
) => {

    if (!Object.keys(window.myData.travel.TravelList).includes(eleID) && eleID !== "World") {

        let traveledList = document.querySelector("#travel_TraveledList");
        let selectedArea = document.querySelector(`#${eleID}_span`);

        let TraveledList_rect = traveledList.getBoundingClientRect();
        let selectedArea_rect = selectedArea.getBoundingClientRect();

        document.documentElement.style.setProperty(
            "--travel-Traveled-List-Selected-Span-left",
            `${selectedArea_rect.left - TraveledList_rect.left + traveledList.scrollLeft - 2}px`
        );

        document.querySelectorAll(`#travel_TraveledList span:not(#${eleID}_span)`).forEach( element => {
            element.style.opacity = "0";
        });

        selectedArea.classList.add("areaSelectedwithAniamtion");

        setTimeout(() => {

            selectedArea.classList.add("areaSelected");
        }, 500);

        return;
    }

    let TraveledListName = eleID === "World" 
        ? Object.keys(window.myData.travel.TravelList)
        : Object.keys(window.myData.travel.TravelList[eleID]);

    const temp_Span = document.querySelector("#travel_TraveledList").querySelectorAll("span");
    temp_Span.forEach( element => {
        element.classList.add("spanHide");
    });

    setTimeout( async () => {

        temp_Span.forEach( element => {
            document.querySelector("#travel_TraveledList").removeChild(element);
        });

        setTimeout( async () => {

            for (var i = 0; i < TraveledListName.length; i++) {

                let areaName = TraveledListName[i];

                let a = document.createElement("span");
                a.id = `${areaName}_span`;
                a.classList.add("span_LoadingToShow");
                a.textContent = 
                    window.globalValues.translateData.country[window.globalValues.language][areaName]
                    || window.globalValues.translateData[`country${eleID}`][[window.globalValues.language]][areaName]
        
                document.querySelector("#travel_TraveledList").appendChild(a);

                await new Promise(r => setTimeout(r, 50));

                setTimeout(() => {
                    a.classList.remove("span_LoadingToShow");
                }, 1500);
            }

        }, 250);
    }, 250);

}

const travel_MapsClick = async (
    clickEvent
) => {

    const { e, element, baseID, obj } = clickEvent;

    console.log(document.querySelector("#Map_World").contentDocument.querySelector("#CN"));
    console.log(element);

    await travel_UpdateTraveledList(element.id);
    if (baseID === "Map_World") {
    
        travel_MapsClick_World(obj, element);
    } else {
    }
}

const travel_MapsBtnClick = async (
    clickEvent
) => {

    const { e } = clickEvent;

    await travel_UpdateTraveledList("World");

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
