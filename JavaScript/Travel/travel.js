
export const SeeChen_TravelPage = {

    init: async () => {

        window.myData.travel.TravelList = await window.myTools.getJson("/Data/Travel/TraveledList.json");
        await SeeChen_TravelPage.bindEvent();

        document.querySelector("#travel_CountryMapsBox").classList.add("MapCountryHide");
        document.querySelectorAll("#travel_CountryMapsBox object").forEach(obj => {

            obj.classList.add("MapIsHide");
        });

        document.querySelector("#travel_ContentExpand").addEventListener("click", (e) => {

            document.querySelector("#travel_ContentExpand").classList.toggle("contentExpand");

            document.querySelector("#box_navBar").classList.toggle("navShow");

            if (document.querySelector("#travel_ContentExpand").classList.contains("contentExpand")) {
                window.router.route("/travel?expand=true");
            } else {
                window.router.route("/travel");
            }
            
        });

        await SeeChen_TravelPage_ImgLabels.buildRelationshipMap();
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
        obj_TraveledList.addEventListener("mouseover", (e) => {

            let [ _, baseMapId, targetMapId ] = e.target.id.split("_");
            window.eventBus.emit("mapMouseEnter", {
                e,
                baseMapId: `Map_${baseMapId}`,
                targetMapId
            });
        });
        obj_TraveledList.addEventListener("mouseout", (e) => {

            let [ _, baseMapId, targetMapId ] = e.target.id.split("_");
            window.eventBus.emit("mapMouseLeave", {
                e,
                baseMapId: `Map_${baseMapId}`,
                targetMapId
            });
        });

        const travelCountryStory = document.querySelectorAll(".travel_Country_Story");
        travelCountryStory.forEach(countryStory => {
            countryStory.addEventListener("click", (e) => {
                window.eventBus.emit("mapMouseClick", {
                    e,
                    baseMapId: "Map_World",
                    targetMapId: countryStory.id.split("_")[1]
                });
            })
        });

        document.querySelector("#travel_TraveledList").addEventListener("scroll", (e) => {
            window.eventBus.emit("traveledBottomScroll", { e });
        });

        document.querySelector("#travel_btn_MapsBack").addEventListener("click", (e) => {
            window.eventBus.emit("travelMapsBackBtnClick", { e });
        });
    },

    registerEvents: () => {

        const travel_EventHandler = {

            mapMouseClick: SeeChen_TravelPage_MapsAction.mouseClick,
            mapMouseEnter: SeeChen_TravelPage_MapsAction.mouseEnter,
            mapMouseLeave: SeeChen_TravelPage_MapsAction.mouseLeave,

            travelMapsBackBtnClick: SeeChen_TravelPage_Click.mapBackBtn,

            traveledBottomScroll: SeeChen_TravelPage_Traveled.bottomListScroll
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

        await SeeChen_TravelPage_Traveled.bottomListUpdate(baseMapId, targetMapId);

        if (baseMapId === "Map_World") {

            await window.router.route(`/travel/${targetMapId}`);
            SeeChen_TravelPage_MapsAction.mapAnimation(baseMap, targetMap);
            document.querySelector("#traveled_World").classList.add("traveled_WorldHide");
            await new Promise(r => setTimeout(r, 500));
            document.querySelector("#traveled_World").style.display = "none";
        } else {

        }
    },

    mapAnimation: async (
        baseMap,
        targetMap
    ) => {

        sessionStorage.setItem("WorldMapsScrollLeft", document.querySelector("#travel_MapsBox").scrollLeft);

        baseMap.classList.add("WorldMapsHide");
        document.querySelector(`#travel_CountryMapsBox`).classList.remove("MapCountryHide");
        document.querySelector(`#Map_${targetMap.id}`).classList.add("MapIsShow");

        let base_Rect = baseMap.getBoundingClientRect();
        let current_Rect = targetMap.getBoundingClientRect();

        var mapPosition = {
            "top": 0,
            "left": 0,
            "width": 0,
            "height": 0
        }

        mapPosition["top"] = current_Rect.top + base_Rect.top;
        mapPosition["left"] = current_Rect.left + base_Rect.left;
        mapPosition["width"] = current_Rect.width;
        mapPosition["height"] = current_Rect.height;
        
        document.documentElement.style.setProperty("--travel-before-scale-height", `${mapPosition["height"]}px`);
        document.documentElement.style.setProperty("--travel-before-scale-width", `${mapPosition["width"]}px`);
        document.documentElement.style.setProperty("--travel-before-scale-top", `${mapPosition["top"]}px`);
        document.documentElement.style.setProperty("--travel-before-scale-left", `${mapPosition["left"]}px`);
        
        setTimeout(() => {
    
            document.querySelector(`#travel_CountryMapsBox`).classList.add("withAnimation");
            document.querySelector(`#travel_CountryMapsBox`).classList.add("afterScale");
            setTimeout(() => {
                
                baseMap.classList.add("WorldMapsHideDisplay");
                document.querySelector("#travel_btn_MapsBack").classList.remove("btn_Hide");
            }, 500);
        }, 500);
    }
}

const SeeChen_TravelPage_Traveled = {

    bottomListScroll: (
        scrollEvent
    ) => {

        const { e } = scrollEvent;
        const traveled_BottomTraveledList = document.querySelector("#travel_TraveledList");

        traveled_BottomTraveledList.classList.remove(
            "at_left",
            "at_right"
        );

        if (e.target.scrollLeft === 0) {
            traveled_BottomTraveledList.classList.add("at_left");
        } else if (
            traveled_BottomTraveledList.scrollWidth <= 1.05 * (
                traveled_BottomTraveledList.scrollLeft + traveled_BottomTraveledList.clientWidth
            )
        ) {

            traveled_BottomTraveledList.classList.add("at_right");
        }
    },

    bottomListUpdate: async (
        baseMapId,
        targetId
    ) => {

        let baseID = baseMapId.split("_")[1];

        if (!Object.keys(window.myData.travel.TravelList).includes(targetId) && targetId !== "World") {

            let traveledList = document.querySelector("#travel_TraveledList");
            let selectedArea = document.querySelector(`#span_${baseID}_${targetId}`);

            if (selectedArea.classList.contains("areaSelected")) {

                await window.router.route(`/travel/${baseID}`);

                setTimeout( async () => {

                    selectedArea.classList.remove("areaSelected");

                    await new Promise(r => setTimeout(r, 1250));

                    selectedArea.classList.remove("areaSelectedwithAniamtion");

                    document.querySelectorAll(`#travel_TraveledList span:not(#span_${baseID}_${targetId}`).forEach( element => {
                        element.style.opacity = "1";
                        element.style.pointerEvents = "auto";
                    });
                }, 500);

                return;
            }

            await window.router.route(`/travel/${baseID}/${targetId}`);

            let TraveledList_Rect = traveledList.getBoundingClientRect();
            let SelectedArea_Rect = selectedArea.getBoundingClientRect();

            document.documentElement.style.setProperty(
                "--travel-Traveled-List-Selected-Span-left",
                `${SelectedArea_Rect.left - TraveledList_Rect.left + traveledList.scrollLeft - 2}px`
            );

            document.querySelectorAll(`#travel_TraveledList span:not(#span_${baseID}_${targetId}`).forEach( element => {
                element.style.opacity = "0";
                element.style.pointerEvents = "none";
            });

            setTimeout( async () => {
                selectedArea.classList.add("areaSelectedwithAniamtion");
                await new Promise(r => setTimeout(r, 50));
                selectedArea.classList.add("areaSelected");
                traveledList.scrollTo(0, 0);
            }, 500);
    
            return;
        }
    
        let TraveledListName = targetId === "World" 
            ? Object.keys(window.myData.travel.TravelList)
            : Object.keys(window.myData.travel.TravelList[targetId]);
    
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
                    a.id = `span_${targetId}_${areaName}`;
                    a.classList.add("span_LoadingToShow");
                    a.textContent = 
                        window.globalValues.translateData.country[window.globalValues.language][areaName]
                        || window.globalValues.translateData[`country${targetId}`][[window.globalValues.language]][areaName]
            
                    document.querySelector("#travel_TraveledList").appendChild(a);
    
                    await new Promise(r => setTimeout(r, 50));
    
                    setTimeout(() => {
                        a.classList.remove("span_LoadingToShow");
                    }, 1500);
                }
    
            }, 250);
        }, 250);
    },
}

const SeeChen_TravelPage_ImgLabels = {

    buildRelationshipMap: async () => {

        const labelMap = {}
        Object.entries(window.myData.travel.TravelList).forEach(([countryId, countryData]) => {

            labelMap[countryId] = new Set();
            window.myData.travel.CityName[countryId] = {};
            Object.entries(countryData).forEach(([provinceId, { img }]) => {

                window.myData.travel.CityName[countryId][provinceId] = [];

                labelMap[provinceId] = new Set();

                labelMap[countryId].add(provinceId);
                labelMap[provinceId].add(countryId);
                img?.forEach(({ city, labels }) => {

                    !window.myData.travel.CityName[countryId][provinceId].includes(city) 
                        ? !window.myData.travel.CityName[countryId][provinceId].push(city)
                        : "";

                    if (!labelMap[city]) labelMap[city] = new Set();
                    labelMap[countryId].add(city);
                    labelMap[provinceId].add(city);
                    labelMap[city].add(countryId).add(provinceId);
                    for (let label of labels) {
                        if (!labelMap[label]) labelMap[label] = new Set();
                        labelMap[countryId].add(label);
                        labelMap[provinceId].add(label);
                        labelMap[city].add(label);
                        labelMap[label].add(countryId).add(provinceId).add(city);
                        for (let otherLabel of labels) {
                            label === otherLabel ? "" : labelMap[label].add(otherLabel);
                        }
                    }   
                });
            });
        });

        Object.entries(labelMap).forEach(([key, values]) => {
            window.myData.travel.LabelsMap[key] = Array.from(values);
        });

        console.log(window.myData.travel.LabelsMap);
        console.log(window.myData.travel.CityName);
        SeeChen_TravelPage_ImgLabels.filterLabel(["CN", "BeiJing", "_city0_", "_city1_", "MY"]);
    },

    filterLabel: (
        labels
    ) => {

        const relatedSets = labels.map(label => {
            const relatedLabel = window.myData.travel.LabelsMap[label];
            return new Set([label, ...relatedLabel]);
        });
        console.log(relatedSets);

        const intersectedLabels = SeeChen_TravelPage_ImgLabels.getIntersection(relatedSets);

        console.log(intersectedLabels);
    },


    getIntersection: (
        arrays
    ) => {
        if (arrays.length === 0 || arrays.length === 1) {
            return arrays;
        }
        return arrays.reduce((acc, set) => acc.filter(x => set.has(x)), [...arrays[0]]);
    }
}

const SeeChen_TravelPage_Click = {

    mapBackBtn: async (
        clickEvent
    ) => {

        const { e } = clickEvent;

        const selectedArea = document.querySelector(".areaSelected");
        if (selectedArea) {

            let [ _, baseMapId, targetMapId ] = selectedArea.id.split("_");
            window.eventBus.emit("mapMouseClick", {
                e,
                baseMapId: `Map_${baseMapId}`,
                targetMapId
            });

            return;
        }

        document.querySelector("#traveled_World").style.display = "initial";
        await new Promise(r => setTimeout(r, 50));
        document.querySelector("#traveled_World").classList.remove("traveled_WorldHide");

        await SeeChen_TravelPage_Traveled.bottomListUpdate("World", "World");

        await window.router.route(`/travel`);

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
}

const travel_ChangeAreaName = (
    baseID,
    areaID
) => {

    if (baseID === "Map_TraveledList") return;

    baseID = baseID.split("_")[1].toUpperCase();
    let areaName = 
        window.globalValues.translateData.country[window.globalValues.language][areaID] ||
        window.globalValues.translateData[`country${baseID}`][[window.globalValues.language]][areaID];

    document.querySelector(".p_AreaName:not(.areaNameDisplay)").innerText = areaName;
    document.querySelectorAll(".p_AreaName").forEach(el => {
        el.classList.toggle("areaNameDisplay");
    });
}
