
export const SeeChen_TravelPage = {

    init: async () => {

        window.myData.travel.TravelList = await window.myTools.getJson("/Data/Travel/TraveledList.json");
        await SeeChen_TravelPage.render();

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

            let OldImgDetails = window.myTools.deepCopy(window.myData.travel.CurrentImgDetails);
            window.myData.travel.CurrentImgDetails.children[1].props["src"] = e.target.src;
            window.myData.travel.CurrentImgDetails.children[2].children[0].lang = "imageTitle";
            window.myData.travel.CurrentImgDetails.children[2].children[0].children = [e.target.dataset.title];
            window.myData.travel.CurrentImgDetails.children[2].children[3].lang = "imageDesc";
            window.myData.travel.CurrentImgDetails.children[2].children[3].children = [e.target.dataset.desc];

            let fullAddress = "";
            let currentCountry = e.target.dataset.country;
            let provinceObj = `country${currentCountry}`;
            let cityObj = `city${currentCountry}`;
            if (window.globalValues.language === "zh") {
                fullAddress = `
                    ${window.globalValues.translateData["country"][window.globalValues.language][currentCountry]}${window.globalValues.translateData[provinceObj][window.globalValues.language][e.target.dataset.province]}${window.globalValues.translateData[cityObj][window.globalValues.language][e.target.dataset.city]}.
                `;
            } else {
                fullAddress = `
                    ${window.globalValues.translateData[cityObj][window.globalValues.language][e.target.dataset.city]}, ${window.globalValues.translateData[provinceObj][window.globalValues.language][e.target.dataset.province]}, ${window.globalValues.translateData["country"][window.globalValues.language][currentCountry]}.
                `;
            }
            window.myData.travel.CurrentImgDetails.children[2].children[1].children = [fullAddress];

            window.myData.travel.CurrentImgDetails.children[2].children[2].children = []
            e.target.dataset.labels.split(",").forEach(label => {
                
                window.myData.travel.CurrentImgDetails.children[2].children[2].children.push({
                    tag: "span",
                    props: {},
                    lang: "imageLabel",
                    children: [label]
                });
            });

            window.vDom.Patch(
                document.querySelector("#box_TravelPage"),
                window.vDom.Diff(
                    OldImgDetails,
                    window.myData.travel.CurrentImgDetails
                )
            );
            window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

                if (!el) return;
                document.querySelector(`#${parent}`).removeChild(el);
            });
            window.globalValues.nodeToRemove = [];

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
                    detailsArea.scrollTo(0, 0);
                }, 250);
            }, 250);
        });

        document.querySelector("#img_clicked_details").addEventListener("click", (e) => {

            if (e.target.tagName === "IMG" || e.target.classList.contains("img_details")) {
                return;
            }
            document.querySelector("#img_clicked_details").classList.add("hideInView");
            document.querySelector(".imgClicked").classList.add("imgClicked_NoAnimation");

            setTimeout(() => {
                document.querySelector("#img_clicked_details").classList.add("hideNoAnimation");
                document.querySelector(".imgClicked").classList.remove("imgClicked");
                setTimeout(() => {
                    document.querySelector(".imgClicked_NoAnimation").classList.remove("imgClicked_NoAnimation");
                }, 100);
            }, 500);
        });

        await SeeChen_TravelPage.registerEvents();
    },

    render: async () => {

        var travelPageLayout = await window.myTools.getJson("/Layout/Webpages/Travel/Travel.json");

        window.myData.travel.CurrentImgList = travelPageLayout.children[5].children[3].children[2].children[0];
        window.myData.travel.CurrentImgTopBar = travelPageLayout.children[5].children[3].children[1].children[0];
        window.myData.travel.CurrentImgDetails = travelPageLayout.children[0];

        Object.keys(window.myData.travel.TravelList).forEach(CountryName => {
            travelPageLayout.children[5].children[2].children.push({
                tag: "span",
                props: {
                    id: `span_World_${CountryName}`
                },
                lang: "country",
                children: [CountryName]
            })
        });

        var travelPageDom = window.vDom.Create(travelPageLayout, {
            travel: window.globalValues.translateData.travel[window.globalValues.language],
            country: window.globalValues.translateData.country[window.globalValues.language]
        });

        window.globalValues.currentVDom = travelPageLayout;
         
        document.querySelector("#box_contentArea").appendChild(
            window.vDom.Render(
                travelPageDom
            )
        );
    },

    bindEvent: async () => {

        const obj_Maps = document.querySelectorAll("Object");
        obj_Maps.forEach( obj => {

            obj.addEventListener("load", () => {

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

    registerEvents: async () => {

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
        
            mapMouseClick: SeeChen_TravelPage_MapsAction.mouseClick,
            mapMouseEnter: SeeChen_TravelPage_MapsAction.mouseEnter,
            mapMouseLeave: SeeChen_TravelPage_MapsAction.mouseLeave,

            travelMapsBackBtnClick: SeeChen_TravelPage_Click.mapBackBtn,

            traveledBottomScroll: SeeChen_TravelPage_Traveled.bottomListScroll,

            cityLabelClick: SeeChen_TravelPage_ImgLabels_Event.click_label
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

                DisplayCityLabel = Array.isArray(DisplayCityLabel) ? DisplayCityLabel : Object.values(DisplayCityLabel).flat();

                let oldTorLabelBar = window.myTools.deepCopy(window.myData.travel.CurrentImgTopBar);
                window.myData.travel.CurrentImgTopBar.children[0].children[1].children = [];
                DisplayCityLabel.forEach(city => {

                    let newCityLabel = {
                        tag: "span",
                        props: {
                            id: `LabelCity_${city}`,
                            class: "stay"
                        },
                        lang: `city${window.myData.travel.SelectedLabel[0]}`,
                        children: [city]
                    }

                    window.myData.travel.CurrentImgTopBar.children[0].children[1].children.push(newCityLabel);
                });

                let DisplayLabelLabel = SeeChen_TravelPage_ImgLabels.filterLabel(window.myData.travel.SelectedLabel)
                let LabelProvince = Object.keys(window.myData.travel.CityName[targetMapId] || window.myData.travel.CityName[window.myData.travel.SelectedLabel[0]]);
                const DisplayLabelRemoveEle = new Set([...DisplayCityLabel, ...LabelProvince, window.myData.travel.SelectedLabel[0]]);
                DisplayLabelLabel = DisplayLabelLabel.filter(element => !DisplayLabelRemoveEle.has(element));

                window.myData.travel.CurrentImgTopBar.children[1].children[1].children = [];
                DisplayLabelLabel.forEach(label => {

                    let newLabelLabel = {
                        tag: "span",
                        props: {
                            id: `LabelLabel_${label}`,
                            class: "stay"
                        },
                        lang: "imageLabel",
                        children: [label]
                    }

                    window.myData.travel.CurrentImgTopBar.children[1].children[1].children.push(newLabelLabel);
                });
                window.vDom.Patch(
                    document.querySelector("#traveled_Area"),
                    window.vDom.Diff(
                        oldTorLabelBar,
                        window.myData.travel.CurrentImgTopBar
                    )
                );
                window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

                    if (!el) return;
                    document.querySelector(`#${parent}`).removeChild(el);
                });
                window.globalValues.nodeToRemove = [];

                var oldImgList = window.myTools.deepCopy(window.myData.travel.CurrentImgList);
                window.myData.travel.CurrentImgList.children.forEach(child => {
                    child["children"] = [];
                });
                await new Promise(r => setTimeout(r, 1500));
                const img_current_country_pro = window.myData.travel.TravelList[window.myData.travel.SelectedLabel[0]][targetMapId]["img"];

                for (var i = 0; i < img_current_country_pro.length; i++) {

                    let newImgClass = `traveled_story_img Label-${window.myData.travel.SelectedLabel[0]} Label-${targetMapId} Label-${img_current_country_pro[i]["city"]}`;
                    img_current_country_pro[i]['labels'].forEach(label => {
                        newImgClass = `${newImgClass} Label-${label}`
                    });
                    let newImg = {
                        tag: "img",
                        props: {
                            src: `/File/Image/Travel/${window.myData.travel.SelectedLabel[0]}/${targetMapId}/${img_current_country_pro[i]["src"]}`,
                            loading: "lazy",
                            class: newImgClass,
                            "data-title": img_current_country_pro[i]["title"],
                            "data-desc": img_current_country_pro[i]["alt"],
                            "data-country": window.myData.travel.SelectedLabel[0],
                            "data-province": targetMapId,
                            "data-city": img_current_country_pro[i]["city"],
                            "data-labels": img_current_country_pro[i]["labels"]
                        },
                        lang: "",
                        children: []
                    }

                    window.myData.travel.CurrentImgList.children[i % 2].children.push(newImg);
                }
                window.vDom.Patch(
                    document.querySelector("#traveled_ImgArea"),
                    window.vDom.Diff(
                        oldImgList,
                        window.myData.travel.CurrentImgList
                    )
                );
                window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

                    if (!el) return;
                    document.querySelector(`#${parent}`).removeChild(el);
                });
                window.globalValues.nodeToRemove = [];
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
