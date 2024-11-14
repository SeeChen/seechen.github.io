
export const SeeChen_TravelPage = {

    init: async () => {

        window.myData.travel.TravelList = await window.myTools.getJson("/Data/Travel/TraveledList.json");
        await SeeChen_TravelPage.bindEvent();

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

            document.querySelector("#travel_ContentExpand").classList.toggle("contentExpand");

            // const t = document.querySelector("div:has(> #travel_TraveledStory)");

            document.querySelector("#box_navBar").classList.toggle("navShow");
            
        });
    },

    render: async () => {

    },

    bindEvent: async () => {

        const obj_Maps = document.querySelectorAll("Object");
        obj_Maps.forEach( obj => {

            const container = obj.contentDocument;
            container.addEventListener("click", (e) => {

                if (e.target.classList.contains("visited")) {

                    window.eventBus.emit("mapMouseClick", {
                        e,
                        baseMapId: obj.id,
                        targetMapId: e.target.id
                    });
                }
            });
            container.addEventListener("mouseover", (e) => {

                if (e.target.classList.contains("visited")) {

                    window.eventBus.emit("mapMouseEnter", {
                        e,
                        baseMapId: obj.id,
                        targetMapId: e.target.id
                    });
                }
            });
            container.addEventListener("mouseout", (e) => {

                if (e.target.classList.contains("visited")) {

                    window.eventBus.emit("mapMouseLeave", {
                        e,
                        baseMapId: obj.id,
                        targetMapId: e.target.id
                    });
                }
            });
        });

        const obj_TraveledList = document.querySelector("#travel_TraveledList");
        obj_TraveledList.addEventListener("click", (e) => {

            let [ _, baseMapId, targetMapId ] = e.target.id.split("_");
            window.eventBus.emit("mapMouseClick", {
                e,
                baseMapId: `Map_${baseMapId}`,
                targetMapId
            });
        });
    },

    registerEvents: () => {

        const travel_EventHandler = {

            mapMouseClick: SeeChen_TravelPage_MapsAction.mouseClick,
            mapMouseEnter: SeeChen_TravelPage_MapsAction.mouseEnter,
            mapMouseLeave: SeeChen_TravelPage_MapsAction.mouseLeave,

            travelMapsBtnClick: travel_MapsBtnClick,

            traveledScroll: traveled_Scroll
        }

        Object.entries(travel_EventHandler).forEach(([event, handler]) => {

            window.eventBus.on(event, handler);
        });
    },

    clearUp: () => {

        const travel_EventHandler = {
        

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

const SeeChen_TravelPage_MapsAction = {

    mouseEnter: (
        mouseEvent
    ) => {

        const { e, baseMapId, targetMapId } = mouseEvent;
        travel_ChangeAreaName(baseMapId, targetMapId);
    },

    mouseLeave: (
        mouseEvent
    ) => {

        const { e, baseMapId, targetMapId } = mouseEvent;
        travel_ChangeAreaName(baseMapId, baseMapId.split("_")[1].toUpperCase());
    },

    mouseClick: async (
        clickEvent
    ) => {

        const { e, baseMapId, targetMapId } = clickEvent;

        const baseMap = document.querySelector(`#${baseMapId}`);
        const targetMap = baseMap.contentDocument.querySelector(`#${targetMapId}`);

        await travel_UpdateTraveledList(baseMapId, targetMapId);

        if (baseMapId === "Map_World") {

            travel_MapsClick_World(baseMap, targetMap);
        } else {}
    }
}

const SeeChen_TravelPage_TraveledList = {

    updateList: async () => {

    }
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

const travel_MapsClick_World  = (
    obj,
    element
) => {

    sessionStorage.setItem("WorldMapsScrollLeft", document.querySelector("#travel_MapsBox").scrollLeft);
    
    obj.classList.add("WorldMapsHide");
    document.querySelector(`#travel_CountryMapsBox`).classList.remove("MapCountryHide");
    document.querySelector(`#Map_${element.id}`).classList.add("MapIsShow");

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
    baseMapId,
    eleID
) => {

    if (!Object.keys(window.myData.travel.TravelList).includes(eleID) && eleID !== "World") {

        let traveledList = document.querySelector("#travel_TraveledList");
        let selectedArea = document.querySelector(`#span_${baseMapId.split("_")[1]}_${eleID}`);

        let TraveledList_rect = traveledList.getBoundingClientRect();
        let selectedArea_rect = selectedArea.getBoundingClientRect();

        document.documentElement.style.setProperty(
            "--travel-Traveled-List-Selected-Span-left",
            `${selectedArea_rect.left - TraveledList_rect.left + traveledList.scrollLeft - 2}px`
        );

        document.querySelectorAll(`#travel_TraveledList span:not(#span_${baseMapId.split("_")[1]}_${eleID}`).forEach( element => {
            element.style.opacity = "0";
        });

        setTimeout( async () => {
            selectedArea.classList.add("areaSelectedwithAniamtion");
            await new Promise(r => setTimeout(r, 50));
            selectedArea.classList.add("areaSelected");
            traveledList.scrollTo(0, 0);
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
                a.id = `span_${eleID}_${areaName}`;
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

const travel_MapsBtnClick = async (
    clickEvent
) => {

    const { e } = clickEvent;

    await travel_UpdateTraveledList("World", "World");

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
