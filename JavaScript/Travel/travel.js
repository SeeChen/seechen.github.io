
export const SeeChen_TravelPage = {

    init: async () => {

        window.myData.travel.TravelList = await window.myTools.getJson("/Data/Travel/TraveledList.json");
        await SeeChen_TravelPage.bindEvent();

        document.querySelector("#travel_CountryMapsBox").classList.add("MapCountryHide");
        document.querySelectorAll("#travel_CountryMapsBox object").forEach(obj => {

            obj.classList.add("MapIsHide");
        });

        await SeeChen_TravelPage_ImgLabels.buildRelationshipMap();

        document.querySelector("#traveled_ImgArea").addEventListener("click", (e) => {

            if (e.target.tagName !== "IMG") {
                return;
            }

            const detailsArea = document.querySelector("#img_clicked_details");

            detailsArea.querySelector("img").src = e.target.src;
            detailsArea.scrollTo(0, 0);

            const currentRect = e.target.getBoundingClientRect();

            let current_top = currentRect.top;
            let current_left = currentRect.left;
            let current_width = e.target.offsetWidth;
            let current_height = e.target.offsetHeight;

            document.documentElement.style.setProperty("--travel-Img-Clicked-Details-Box-top", `${current_top}px`);
            document.documentElement.style.setProperty("--travel-Img-Clicked-Details-Box-left", `${current_left}px`);
            document.documentElement.style.setProperty("--travel-Img-Clicked-Details-Box-width", `${current_width}px`);
            document.documentElement.style.setProperty("--travel-Img-Clicked-Details-Box-height", `${current_height}px`);

            setTimeout(() => {

                detailsArea.classList.remove("hideNoAnimation");
                setTimeout(() => {

                    e.target.classList.add("imgClicked");
                    detailsArea.classList.remove("hideInView");
                }, 250);
            }, 250);
        });

        document.querySelector("#img_clicked_details").addEventListener("click", (e) => {

            if (e.target.tagName === "IMG" || e.target.classList.contains("img_details")) {
                return;
            }

            document.querySelector("#img_clicked_details").classList.add("hideInView");

            setTimeout(() => {
                document.querySelector("#img_clicked_details").classList.add("hideNoAnimation");
                document.querySelector(".imgClicked").classList.remove("imgClicked");
            }, 500);
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

        document.querySelector("#traveled_Area_AreaList").addEventListener("click", (e) => {
            window.eventBus.emit("cityLabelClick", { e });
        });
    },

    registerEvents: () => {

        const travel_EventHandler = {

            mapMouseClick: SeeChen_TravelPage_MapsAction.mouseClick,
            mapMouseEnter: SeeChen_TravelPage_MapsAction.mouseEnter,
            mapMouseLeave: SeeChen_TravelPage_MapsAction.mouseLeave,

            travelMapsBackBtnClick: SeeChen_TravelPage_Click.mapBackBtn,

            traveledBottomScroll: SeeChen_TravelPage_Traveled.bottomListScroll,

            cityLabelClick: SeeChen_TravelPage_ImgLabels_Event.click_label
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

        const traveled_AreaList = document.querySelector("#traveled_Area_AreaList");
        let DisplayCityLabel;
        if (window.myData.travel.SelectedLabel.includes(targetMapId)) {
            window.myData.travel.SelectedLabel.splice(window.myData.travel.SelectedLabel.indexOf(targetMapId), 1);
            DisplayCityLabel = window.myData.travel.CityName[targetMapId] || window.myData.travel.CityName[window.myData.travel.SelectedLabel[0]];
        } else {
            window.myData.travel.SelectedLabel.push(targetMapId);
            DisplayCityLabel = window.myData.travel.CityName[targetMapId] || window.myData.travel.CityName[window.myData.travel.SelectedLabel[0]][targetMapId];
        }

        if (baseMapId === "Map_World") {

            await window.router.route(`/travel/${targetMapId}`);
            SeeChen_TravelPage_MapsAction.mapAnimation(baseMap, targetMap);
            document.querySelector("#traveled_World").classList.add("traveled_WorldHide");
            document.querySelector("#traveled_Area").style.display = "initial";

            await new Promise(r => setTimeout(r, 500));
            document.querySelector("#traveled_Area").classList.add("isShow")
            document.querySelector("#traveled_World").style.display = "none";
        } else {

            document.querySelector("#travel_TraveledList_title").classList.toggle("view-hide");
            document.querySelector("#travel_TraveledList").classList.toggle("view-hide");

            if (window.myData.travel.SelectedLabel.length > 1) {

                const toRemoveCity = traveled_AreaList.querySelectorAll("#table_city span");
                const toRemoveLabel = traveled_AreaList.querySelectorAll("#table_label span");
                toRemoveCity.forEach(element => {
                    traveled_AreaList.querySelector("#table_city").removeChild(element);
                });
                toRemoveLabel.forEach(element => {
                    traveled_AreaList.querySelector("#table_label").removeChild(element);
                });
                DisplayCityLabel = Array.isArray(DisplayCityLabel) ? DisplayCityLabel : Object.values(DisplayCityLabel).flat();
                DisplayCityLabel.forEach(city => {

                    let label_city = document.createElement("span");
                    label_city.id = `LabelCity_${city}`;
                    label_city.classList.add("stay");
                    label_city.textContent = city;
                    document.querySelector("#table_city").appendChild(label_city);
                });
                let DisplayLabelLabel = SeeChen_TravelPage_ImgLabels.filterLabel(window.myData.travel.SelectedLabel)
                let LabelProvince = Object.keys(window.myData.travel.CityName[targetMapId] || window.myData.travel.CityName[window.myData.travel.SelectedLabel[0]]);
                const DisplayLabelRemoveEle = new Set([...DisplayCityLabel, ...LabelProvince, window.myData.travel.SelectedLabel[0]]);
                DisplayLabelLabel = DisplayLabelLabel.filter(element => !DisplayLabelRemoveEle.has(element));
                DisplayLabelLabel.forEach(label => {

                    let label_label = document.createElement("span");
                    label_label.id = `LabelLabel_${label}`;
                    label_label.classList.add("stay");
                    label_label.textContent = label;
                    document.querySelector("#table_label").appendChild(label_label);
                });

                const img_area_to_show = document.querySelectorAll(".img_area");
                img_area_to_show.forEach(element => {
                    element.querySelectorAll(".traveled_story_img").forEach(eleImg => {
                        element.removeChild(eleImg);
                    });
                });
                await new Promise(r => setTimeout(r, 1500));
                const img_current_country_pro = window.myData.travel.TravelList[window.myData.travel.SelectedLabel[0]][targetMapId]["img"];
                for (var i = 0; i < img_current_country_pro.length; i++) {
                    let img = document.createElement("img");
                    img.classList.add(
                        "traveled_story_img", 
                        `Label-${window.myData.travel.SelectedLabel[0]}`, 
                        `Label-${targetMapId}`, 
                        `Label-${img_current_country_pro[i]["city"]}`
                    );
                    img_current_country_pro[i]['labels'].forEach(label => {
                        img.classList.add(`Label-${label}`);
                    });
                    img.loading = "lazy";
                    img.src = `/File/Image/Travel/${window.myData.travel.SelectedLabel[0]}/${targetMapId}/${img_current_country_pro[i]["src"]}`;

                    img_area_to_show[i % 2].appendChild(img);
                }
            }
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

            document.querySelector("#travel_ContentExpand").classList.remove("contentExpand");
            document.querySelector("#box_navBar").classList.remove("navShow");

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

            document.querySelector("#travel_ContentExpand").classList.add("contentExpand");
            document.querySelector("#box_navBar").classList.add("navShow");

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

        if (baseMapId === "World" && targetId === "World") {
            window.myData.travel.SelectedLabel = [];
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

const SeeChen_TravelPage_ImgLabels_Event = {

    click_label: (
        clickEvent
    ) => {

        const { e } = clickEvent;
        
        if (!e.target.id.startsWith("Label")) {
            return;
        }

        e.target.classList.toggle("selected");

        const current_SelectedLabel = `_${e.target.id.split("_")[2]}_`;

        if (window.myData.travel.SelectedLabel.includes(current_SelectedLabel)) {
            window.myData.travel.SelectedLabel.splice(window.myData.travel.SelectedLabel.indexOf(current_SelectedLabel), 1);
        } else {
            window.myData.travel.SelectedLabel.push(current_SelectedLabel);
        }

        const Label_Filter_Full = SeeChen_TravelPage_ImgLabels.filterLabel(window.myData.travel.SelectedLabel);
        const current_City = Label_Filter_Full.filter(element => (Object.keys(window.myData.travel.CityName[Label_Filter_Full[0]]).includes(element)))[0];
        let Label_Filter = Label_Filter_Full.filter(element => (
            element !== Label_Filter_Full[0]
            && element !== current_City
        ));
        const Label_Filter_City = Label_Filter.filter(element => (
            window.myData.travel.CityName[Label_Filter_Full[0]][current_City].includes(element)
        ));
        const Label_Filter_Label = Label_Filter.filter(element => (
            !window.myData.travel.CityName[Label_Filter_Full[0]][current_City].includes(element)
        ));

        const table_city = document.querySelector("#table_city");
        const table_label = document.querySelector("#table_label");

        table_city.querySelectorAll("span").forEach(element => {

            if (Label_Filter_City.includes(`_${element.id.split("_")[2]}_`)) {
                element.classList.add("stay");
                setTimeout(() => {
                    if (element.classList.contains("loadingToHide")) {
                        element.classList.remove("loadingToHide");
                    }
                }, 500);
            } else if (element.classList.contains("stay")) {
                element.classList.add("loadingToHide");
                setTimeout(() => {
                    element.classList.remove("stay");
                }, 500);
            }
        });
        table_label.querySelectorAll("span").forEach(element => {

            if (Label_Filter_Label.includes(`_${element.id.split("_")[2]}_`)) {
                element.classList.add("stay");
                setTimeout(() => {
                    if (element.classList.contains("loadingToHide")) {
                        element.classList.remove("loadingToHide");
                    }
                }, 500);
            } else if (element.classList.contains("stay")) {
                element.classList.add("loadingToHide");
                setTimeout(() => {
                    element.classList.remove("stay");
                }, 500);
            }
        });

        document.querySelectorAll("#traveled_ImgArea .img_area img").forEach(img => {
            const containAllLabel = window.myData.travel.SelectedLabel.every((label) =>
                img.classList.contains(`Label-${label}`)
            );
            if (!containAllLabel) {
                img.classList.add("no-in-choose-animation");
                setTimeout(() => {
                    img.classList.add("no-in-choose");
                }, 500);
            } else {
                img.classList.remove("no-in-choose");
                setTimeout(() => {
                    img.classList.remove("no-in-choose-animation");
                }, 500);
            }
        });
    }
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
    },

    filterLabel: (
        labels
    ) => {

        const relatedSets = labels.map(label => {
            const relatedLabel = window.myData.travel.LabelsMap[label];
            return new Set([label, ...relatedLabel]);
        });

        const intersectedLabels = SeeChen_TravelPage_ImgLabels.getIntersection(relatedSets);

        return intersectedLabels;
    },


    getIntersection: (
        arrays
    ) => {
        if (arrays.length === 0) {
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

            window.myData.travel.SelectedLabel = [window.myData.travel.SelectedLabel[0], window.myData.travel.SelectedLabel[1]];

            let [ _, baseMapId, targetMapId ] = selectedArea.id.split("_");
            window.eventBus.emit("mapMouseClick", {
                e,
                baseMapId: `Map_${baseMapId}`,
                targetMapId
            });

            return;
        }

        document.querySelector("#traveled_World").style.display = "initial";
        document.querySelector("#traveled_Area").classList.remove("isShow");
        await new Promise(r => setTimeout(r, 50));
        document.querySelector("#traveled_Area").style.display = "none";
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
