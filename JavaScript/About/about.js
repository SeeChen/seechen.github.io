/* 
    File: about.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/About/about.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/

import { userLanguage } from "/JavaScript/General/language.js";

export const SeeChen_AboutPage = {

    init: async () => {

        await SeeChen_AboutPage.render();
        await SeeChen_AboutPage.bindEvents();


        await SeeChen_AboutPage.registerEvents();
        document.querySelector("#box_AboutPage").style.opacity = 1;
    },

    render: async () => {

        var aboutPageLayout = await window.myTools.getJson("/Layout/Webpages/About/About.json");
        var aboutSessionTemplate = await window.myTools.getJson("/Layout/Webpages/About/Session.json");

        var aboutSessionList = await window.myTools.getJson("/Data/About/SessionList.json");
        
        Object.keys(aboutSessionList).forEach(sessionTitle => {

            if (Object.keys(aboutSessionList[sessionTitle].children).length === 0) {
                return;
            }

            var aboutSession = window.myTools.deepCopy(aboutSessionTemplate);

            aboutSession.props["data-event-handler"] = aboutSessionList[sessionTitle]["handle"];

            aboutSession.children[1].lang = "about";
            aboutSession.children[1].children = [sessionTitle];
            aboutSession.children[1].props["id"] = aboutSessionList[sessionTitle]["id"];

            Object.keys(aboutSessionList[sessionTitle]["children"]).forEach(sessionContent => {

                var aboutSessionChildren = aboutSessionList[sessionTitle]["children"][sessionContent];

                aboutSession.children[2].children.push({
                    tag: "span",
                    props: {
                        id: `${aboutSessionList[sessionTitle]["handle"].split("_")[1]}-${aboutSessionChildren["handle"].split("-")[1]}`,
                        class: "session-children",
                        "data-event-handle": aboutSessionChildren["handle"],
                        "data-target-link": aboutSessionChildren["link"] ? aboutSessionChildren["link"] : null,

                        "data-original-obj": sessionContent
                    },
                    lang: "about",
                    children: [sessionContent]
                });
            });

            aboutPageLayout.children[0].children.push(aboutSession);
        });

        document.querySelector("#box_contentArea").appendChild(
            window.vDom.Render(
                aboutPageLayout
            )
        );

        window.myData.about.vDomLayot = aboutPageLayout;
        window.myData.about.OldLayout = window.vDom.Create(aboutPageLayout);

        const sessionContent_All = document.querySelectorAll(".session_Content");
        sessionContent_All.forEach(aSession => {

            if (aSession.scrollHeight > aSession.clientHeight) {

                
                aSession.closest(".box_Session").querySelector(".session_ExpandBtn").classList.add("session_ExpandBtnDisplay");
                aSession.closest(".box_Session").querySelector(".session_ExpandBtn").dataset["contentMaxHeight"] = aSession.scrollHeight;
            }
        });
    },

    bindEvents: async () => {

        document.querySelectorAll(".session_ExpandBtn").forEach(ele => {
            ele.addEventListener("click", (e) => {
                window.eventBus.emit("sessionExpand", { e, ele });
            });
        });

        document.querySelectorAll(".box_Session").forEach(boxSession => {

            boxSession.addEventListener("click", (e) => {

                window.eventBus.emit(`${boxSession.dataset.eventHandler}_Click`, { e });
            })
        });
    },

    registerEvents: async () => {

        const about_EventHandler = {

            sessionExpand: SeeChen_AboutPage_Session.expand_Content,

            aboutSession_Language_Click: SeeChen_AboutPage_Language.click,
            aboutSession_AboutSites_Click: SeeChen_AboutPage_AboutSites.click,
            aboutSession_AboutMe_Click: SeeChen_AboutPage_AboutMe.click,
            aboutSession_Acknowledgments_Click: SeeChen_AboutPage_Acknowledgments.click,
            
            aboutSites_close: SeeChen_AboutPage_AboutSites.closeClick,
            aboutMe_close: SeeChen_AboutPage_AboutMe.closeClick,
            acnkowledgments_close: SeeChen_AboutPage_Acknowledgments.closeClick,
        }

        Object.entries(about_EventHandler).forEach(([event, handler]) => {

            window.eventBus.on(event, handler);
        });

    },

    clearUp: () => {

        const about_EventHandler = {
        
            sessionExpand: SeeChen_AboutPage_Session.expand_Content,

            aboutSession_Language_Click: SeeChen_AboutPage_Language.click,
            aboutSession_AboutSites_Click: SeeChen_AboutPage_AboutSites.click,
            aboutSession_AboutMe_Click: SeeChen_AboutPage_AboutMe.click,
            aboutSession_Acknowledgments_Click: SeeChen_AboutPage_Acknowledgments.click,
            
            aboutSites_close: SeeChen_AboutPage_AboutSites.closeClick,
            aboutMe_close: SeeChen_AboutPage_AboutMe.closeClick,
            acnkowledgments_close: SeeChen_AboutPage_Acknowledgments.closeClick,
        }

        Object.entries(about_EventHandler).forEach(([event, handler]) => {

            window.eventBus.off(event, handler);
        });

        document.querySelector("#contentArea").scrollTo(0, 0);

        const boxContent = document.querySelector("#box_contentArea");
        const homeContent = boxContent.querySelector("#box_AboutPage");
        homeContent.style.opacity = 0;

        setTimeout(() => {
            boxContent.removeChild(homeContent);
        }, 1000);
    }
}

const SeeChen_AboutPage_Session = {

    expand_Content: (
        events
    ) => {

        const { e, ele }  = events;

        if (document.querySelector(".session_BtnExpanded") && document.querySelector(".session_BtnExpanded") !== ele) {
            document.querySelector(".session_BtnExpanded").classList.remove("session_BtnExpanded");
        }
        document.documentElement.style.setProperty("--about-Session-session-Content-max-height", `${ele.dataset["contentMaxHeight"]}px`);
        ele.classList.toggle("session_BtnExpanded");
    }
}

const SeeChen_AboutPage_Language = {

    click: async (
        event
    ) => {

        const { e } = event;

        if (e.target.classList.contains("session-children")) {

            window.myData.about.contentExpand = {};

            const vDom_navigationBar = await window.myTools.getJson("/Layout/Webpages/General/Navigation.json");
            const vDom_footerArea = await window.myTools.getJson("/Layout/Webpages/General/Footer.json");

            const old_FooterArea = window.vDom.Create(vDom_footerArea);

            const language_Handle = e.target.dataset.eventHandle;
            
            var language = new userLanguage();
            language.switchLanguage(language_Handle.split("-")[1]);
            window.globalValues.language = language.getLanguage();

            document.querySelector("#box_navBar").removeChild(
                document.querySelector("#box_navBar div:nth-child(2)")
            );

            document.querySelector("#box_navBar").appendChild(
                window.vDom.Render(
                    window.vDom.Create(vDom_navigationBar)
                )
            );

            const new_FooterArea = window.vDom.Create(vDom_footerArea);

            window.vDom.Patch(
                document.querySelector("#box_footerArea"),
                window.vDom.Diff(
                    old_FooterArea,
                    new_FooterArea
                )
            );

            const newLayout = window.vDom.Create(window.myData.about.vDomLayot);
            window.vDom.Patch(
                document.querySelector("#box_contentArea"),
                window.vDom.Diff(
                    window.myData.about.OldLayout,
                    newLayout
                )
            );
            window.myData.about.OldLayout = newLayout;
        }
    }
}

const SeeChen_AboutPage_AboutSites = {

    closeClick: async (
        event
    ) => {

        const { e } = event;

        document.querySelector("#about_ExpandContent").classList.remove("expanded");
        await new Promise(r => setTimeout(r, 100));
        document.querySelector("#about_ExpandContent").classList.remove("expanded-loading");
    },

    click: async (
        event
    ) => {

        const { e } = event;
        
        if (e.target.classList.contains("session-children")) {

            document.querySelector("#box_LoadingAnimation").classList.add("waitToDisplay");
            await new Promise(r => setTimeout(r, 100));
            document.querySelector("#box_LoadingAnimation").classList.add("display");

            const template_AboutSites = await window.myTools.getJson("/Layout/Webpages/About/Session/AboutSites.json");
            const old_ContentExpand = window.myTools.deepCopy(window.myData.about.contentExpand);

            window.myData.about.contentExpand = template_AboutSites;

            window.myData.about.contentExpand.children[0].children[0].children = [e.target.dataset.originalObj];

            let content_url = `/File/About/AboutSites/${window.globalValues.language}/${e.target.id.split("-")[1]}.md`;

            console.log(content_url);
            let content_md = await window.myTools.getTxt(content_url);

            window.myData.about.contentExpand.children[1].props["class"] = "style01";
            window.myData.about.contentExpand.children[1].children = window.md2vDom.convert(content_md);

            window.vDom.Patch(
                document.querySelector("#about_ExpandContent"),
                window.vDom.Diff(
                    old_ContentExpand,
                    window.myData.about.contentExpand
                )
            );
            window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

                if (!el) return;
                el.parentNode.removeChild(el)
            });
            window.globalValues.nodeToRemove = [];
            
            document.querySelector("#about_ExpandContent").classList.add("expanded-loading");
            await new Promise(r => setTimeout(r, 100));
            document.querySelector("#about_ExpandContent").classList.add("expanded");

            document.querySelector("#aboutSites_Content_Close").addEventListener("click", (e) => {
                window.eventBus.emit("aboutSites_close", { e });
            })

            document.querySelector("#box_LoadingAnimation").classList.remove("display");
            await new Promise(r => setTimeout(r, 600));
            document.querySelector("#box_LoadingAnimation").classList.remove("waitToDisplay");
        }
    }
}

const SeeChen_AboutPage_AboutMe = {

    loadingBiography: async () => {

        document.querySelector("#aboutMe_Biography_Content_Menu").addEventListener("click", (e) => {
            window.eventBus.emit("aboutMe_BiographyMenu_Click", { e });
        });
        document.querySelector(".Biography_aboutMe_FreeTime_Session").addEventListener("click", (e) => {
            window.eventBus.emit("aboutMe_Biography_FreeTime_Click", { e });
        });

        window.eventBus.on("aboutMe_Biography_FreeTime_Click", SeeChen_AboutPage_AboutMe.Biography_FreeTime_Click);
        window.eventBus.on("aboutMe_BiographyMenu_Click", SeeChen_AboutPage_AboutMe.Biography_MenuClick);
    },
    Biography_MenuClick: async (
        event
    ) => {

        const { e } = event;

        var selectedClassName = "Biography_Selected";
        document.querySelector(`.${selectedClassName}`).classList.remove(selectedClassName);
        e.target.classList.add(selectedClassName);

        document.querySelector("#aboutMe_Biography_Content").classList.remove(
            document.querySelector("#aboutMe_Biography_Content_Menu").dataset.currentClass
        );
        document.querySelector("#Biography_Content_MyPhotos").classList.remove(
            document.querySelector("#aboutMe_Biography_Content_Menu").dataset.currentClass
        );
        document.querySelector("#Biography_Content_Real").classList.remove(
            document.querySelector("#aboutMe_Biography_Content_Menu").dataset.currentClass
        );

        var target_Class = e.target.dataset.content;

        document.querySelector("#aboutMe_Biography_Content").classList.add(e.target.dataset.content);
        document.querySelector("#Biography_Content_MyPhotos").classList.add(e.target.dataset.content);
        document.querySelector("#Biography_Content_Real").classList.add(e.target.dataset.content);
        
        document.querySelector("#aboutMe_Biography_Content_Menu").dataset.currentClass = e.target.dataset.content;
    },
    Biography_FreeTime_Click: async (
        event
    ) => {

        const { e } = event;

        document.querySelector(".Biography_aboutMe_FreeTime_Illustrate").classList.add("showBiography_aboutMe_FreeTime_Illustrate");

        document.querySelector(".showBiography_aboutMe_FreeTime_Illustrate").addEventListener("click", (e) => {
            e.target.classList.remove("showBiography_aboutMe_FreeTime_Illustrate");
        });

        document.querySelector(".Biography_aboutMe_FreeTime_Illustrate div").textContent = window.globalValues.translateData["about"][window.globalValues.language][`_${e.target.id}_content_`]; 
    },
    closeBiography: async () => {
        window.eventBus.off("aboutMe_Biography_FreeTime_Click", SeeChen_AboutPage_AboutMe.Biography_FreeTime_Click);
        window.eventBus.off("aboutMe_BiographyMenu_Click", SeeChen_AboutPage_AboutMe.Biography_MenuClick);
    },

    loadingResume: async () => {

        let projectsConfig = await window.myTools.getJson("/File/About/AboutMe/Resume/Projects.json");

        let template_projectsImplDetails_Head = {
            "tag": "p",
            "props": {
                "class": "aboutMe_Resume_Session_Projects_SecondTitle"
            },
            "lang": "about",
            "children": ["_aboutMe_Resume_Projects_ImplDetails_"]
        };

        let template_projectsFeatures_Head = {
            "tag": "p",
            "props": {
                "class": "aboutMe_Resume_Session_Projects_SecondTitle"
            },
            "lang": "about",
            "children": ["_aboutMe_Resume_Projects_Features_"]
        };
        let template_projectsKeyAchievements_Head = {
            "tag": "p",
            "props": {
                "class": "aboutMe_Resume_Session_Projects_SecondTitle"
            },
            "lang": "about",
            "children": ["_aboutMe_Resume_Projects_KeyAchievements_"]
        };

        let template_projects = {
            "tag": "div",
            "props": {
                "class": "aboutMe_Resume_Session_Projects"
            },
            "lang": "",
            "children": [{
                "tag": "p",
                "props": {
                    "class": "aboutMe_Resume_Session_Projects_Title"
                },
                "lang": "",
                "children": []
            }, {
                "tag": "p",
                "props": {
                    "class": "aboutMe_Resume_Session_Projects_Position"
                },
                "lang": "",
                "children": []
            }, {
                "tag": "p",
                "props": {
                    "class": "aboutMe_Resume_Session_Projects_Time"
                },
                "lang": "",
                "children": []
            }, {
                "tag": "p",
                "props": {
                    "class": "aboutMe_Resume_Session_Projects_Description"
                }, 
                "lang": "",
                "children": []
            }]
        }

        let old_Resume = window.myTools.deepCopy(window.myData.about.contentExpand);

        let projectsPersonal = {
            "tag": "div",
            "props": {
                "class": "aboutMe_Resume_Session"
            },
            "lang": "",
            "children": [{
                "tag": "p",
                "props": {
                    "class": "aboutMe_Resume_Session_Title"
                },
                "lang": "about",
                "children": ["_aboutMe_Resume_Projects_Personal_"]
            }]
        };
        let listProjectsPersonal = projectsConfig["Personal"];
        let num_listProjectsPersonal = listProjectsPersonal.length;

        for (let i = 0; i < num_listProjectsPersonal; i++) {
            
            let current_ProjectPersonal = listProjectsPersonal[i][window.globalValues.language];
            let tmpObj_ProjectPersonal = window.myTools.deepCopy(template_projects);

            tmpObj_ProjectPersonal.children[0].children = [current_ProjectPersonal["title"]];

            tmpObj_ProjectPersonal.children[1].children = [current_ProjectPersonal["position"]];
            if (current_ProjectPersonal["position"] === "NaN") {
                tmpObj_ProjectPersonal.children[1].props["class"] += " non-to-display";
            }

            tmpObj_ProjectPersonal.children[2].children = [current_ProjectPersonal["time"]];
            if (current_ProjectPersonal["time"] === "NaN") {
                tmpObj_ProjectPersonal.children[2].props["class"] += " non-to-display";
            }

            tmpObj_ProjectPersonal.children[3].children = [current_ProjectPersonal["desc"]];
            
            tmpObj_ProjectPersonal.children.push(template_projectsImplDetails_Head);
            current_ProjectPersonal["impl"].forEach(implContent => {

                tmpObj_ProjectPersonal.children.push({
                    "tag": "div",
                    "props": {
                        "class": "aboutMe_Resume_Session_Projects_ImplDetails"
                    },
                    "lang": "",
                    "children": [{
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [implContent["title"]]
                    }, {
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [implContent["content"]]
                    }]
                });
            });

            tmpObj_ProjectPersonal.children.push(template_projectsFeatures_Head);
            current_ProjectPersonal["features"].forEach(featuresContent => {

                tmpObj_ProjectPersonal.children.push({
                    "tag": "div",
                    "props": {
                        "class": "aboutMe_Resume_Session_Projects_ImplDetails"
                    },
                    "lang": "",
                    "children": [{
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [featuresContent["title"]]
                    }, {
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [featuresContent["content"]]
                    }]
                });
            });

            tmpObj_ProjectPersonal.children.push(template_projectsKeyAchievements_Head);
            let tempList = {
                "tag": "ol",
                "props": {},
                "lang": "",
                "children": []
            }
            current_ProjectPersonal["key-achievements"].forEach(keyAchievements => {

                tempList.children.push({
                    "tag": "li",
                    "props": {},
                    "lang": "",
                    "children": [keyAchievements]
                });
            });
            tmpObj_ProjectPersonal.children.push(tempList);

            projectsPersonal.children.push(tmpObj_ProjectPersonal);
        }

        let projectsGraduation = {
            "tag": "div",
            "props": {
                "class": "aboutMe_Resume_Session"
            },
            "lang": "",
            "children": [{
                "tag": "p",
                "props": {
                    "class": "aboutMe_Resume_Session_Title"
                },
                "lang": "about",
                "children": ["_aboutMe_Resume_Projects_Graduation_"]
            }]
        };
        let listProjectsGraduation = projectsConfig["Graduation"];
        listProjectsGraduation.forEach(currentProjectsGraudation => {

            let current_ProjectGraduation = currentProjectsGraudation[window.globalValues.language];
            let tmpObj_ProjectGraduation = window.myTools.deepCopy(template_projects);

            tmpObj_ProjectGraduation.children[0].children = [current_ProjectGraduation["title"]];

            tmpObj_ProjectGraduation.children[1].children = [current_ProjectGraduation["position"]];
            if (current_ProjectGraduation["position"] === "NaN") {
                tmpObj_ProjectGraduation.children[1].props["class"] += " non-to-display";
            }

            tmpObj_ProjectGraduation.children[2].children = [current_ProjectGraduation["time"]];
            if (current_ProjectGraduation["time"] === "NaN") {
                tmpObj_ProjectGraduation.children[2].props["class"] += " non-to-display";
            }

            tmpObj_ProjectGraduation.children[3].children = [current_ProjectGraduation["desc"]];
            
            tmpObj_ProjectGraduation.children.push(template_projectsImplDetails_Head);
            current_ProjectGraduation["impl"].forEach(implContent => {

                tmpObj_ProjectGraduation.children.push({
                    "tag": "div",
                    "props": {
                        "class": "aboutMe_Resume_Session_Projects_ImplDetails"
                    },
                    "lang": "",
                    "children": [{
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [implContent["title"]]
                    }, {
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [implContent["content"]]
                    }]
                });
            });

            tmpObj_ProjectGraduation.children.push(template_projectsFeatures_Head);
            current_ProjectGraduation["features"].forEach(featuresContent => {

                tmpObj_ProjectGraduation.children.push({
                    "tag": "div",
                    "props": {
                        "class": "aboutMe_Resume_Session_Projects_ImplDetails"
                    },
                    "lang": "",
                    "children": [{
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [featuresContent["title"]]
                    }, {
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [featuresContent["content"]]
                    }]
                });
            });

            tmpObj_ProjectGraduation.children.push(template_projectsKeyAchievements_Head);
            let tempList = {
                "tag": "ol",
                "props": {},
                "lang": "",
                "children": []
            }
            current_ProjectGraduation["key-achievements"].forEach(keyAchievements => {

                tempList.children.push({
                    "tag": "li",
                    "props": {},
                    "lang": "",
                    "children": [keyAchievements]
                });
            });
            tmpObj_ProjectGraduation.children.push(tempList);

            projectsGraduation.children.push(tmpObj_ProjectGraduation);
        });


        let projectsSchool = {
            "tag": "div",
            "props": {
                "class": "aboutMe_Resume_Session"
            },
            "lang": "",
            "children": [{
                "tag": "p",
                "props": {
                    "class": "aboutMe_Resume_Session_Title"
                },
                "lang": "about",
                "children": ["_aboutMe_Resume_Projects_School_"]
            }]
        };
        let listProjectsSchool = projectsConfig["School"];
        listProjectsSchool.forEach(currentProjectsSchool => {

            let current_ProjectSchool = currentProjectsSchool[window.globalValues.language];
            let tmpObj_ProjectSchool = window.myTools.deepCopy(template_projects);

            tmpObj_ProjectSchool.children[0].children = [current_ProjectSchool["title"]];

            tmpObj_ProjectSchool.children[1].children = [current_ProjectSchool["position"]];
            if (current_ProjectSchool["position"] === "NaN") {
                tmpObj_ProjectSchool.children[1].props["class"] += " non-to-display";
            }

            tmpObj_ProjectSchool.children[2].children = [current_ProjectSchool["time"]];
            if (current_ProjectSchool["time"] === "NaN") {
                tmpObj_ProjectSchool.children[2].props["class"] += " non-to-display";
            }

            tmpObj_ProjectSchool.children[3].children = [current_ProjectSchool["desc"]];
            
            tmpObj_ProjectSchool.children.push(template_projectsImplDetails_Head);
            current_ProjectSchool["impl"].forEach(implContent => {

                tmpObj_ProjectSchool.children.push({
                    "tag": "div",
                    "props": {
                        "class": "aboutMe_Resume_Session_Projects_ImplDetails"
                    },
                    "lang": "",
                    "children": [{
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [implContent["title"]]
                    }, {
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [implContent["content"]]
                    }]
                });
            });

            tmpObj_ProjectSchool.children.push(template_projectsFeatures_Head);
            current_ProjectSchool["features"].forEach(featuresContent => {

                tmpObj_ProjectSchool.children.push({
                    "tag": "div",
                    "props": {
                        "class": "aboutMe_Resume_Session_Projects_ImplDetails"
                    },
                    "lang": "",
                    "children": [{
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [featuresContent["title"]]
                    }, {
                        "tag": "p",
                        "props": {},
                        "lang": "",
                        "children": [featuresContent["content"]]
                    }]
                });
            });

            tmpObj_ProjectSchool.children.push(template_projectsKeyAchievements_Head);
            let tempList = {
                "tag": "ol",
                "props": {},
                "lang": "",
                "children": []
            }
            current_ProjectSchool["key-achievements"].forEach(keyAchievements => {

                tempList.children.push({
                    "tag": "li",
                    "props": {},
                    "lang": "",
                    "children": [keyAchievements]
                });
            });
            tmpObj_ProjectSchool.children.push(tempList);

            projectsSchool.children.push(tmpObj_ProjectSchool);
        });

        window.myData.about.contentExpand.children[1].children[0].children[1].children[0].children.push(projectsPersonal);
        window.myData.about.contentExpand.children[1].children[0].children[1].children[0].children.push(projectsGraduation);
        window.myData.about.contentExpand.children[1].children[0].children[1].children[0].children.push(projectsSchool);

        window.vDom.Patch(
            document.querySelector("#about_ExpandContent"),
            window.vDom.Diff(
                old_Resume,
                window.myData.about.contentExpand
            )
        );
        window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

            if (!el) return;
            el.parentNode.removeChild(el)
        });
        window.globalValues.nodeToRemove = [];

        document.querySelector("#aboutMe_Resume_Download_Area").addEventListener("click", (e) => {
            window.eventBus.emit("aboutMe_Resume_Downloads", { e });
        });

        window.eventBus.on("aboutMe_Resume_Downloads", SeeChen_AboutPage_AboutMe.resuemClick);
    },
    resuemClick: async (
        event
    ) => {

        const { e } = event;

        let arr_target_btn = e.target.id.split("_");
        let fileFormat = arr_target_btn[arr_target_btn.length - 1]

        const downloadLink = document.createElement("a");
        downloadLink.href = `/File/About/AboutMe/Resume/Resume.${fileFormat}`;
        downloadLink.download = `SeeChen-Resume.${fileFormat}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    },

    loadingMyLife: async () => {

        document.querySelector("#aboutMe_MyLife").addEventListener("wheel", (e) => {

            e.preventDefault();

            document.querySelector("#aboutMe_MyLife").scrollLeft += 3 * e.deltaY;
        }, {
            passive: false
        });

        // {
        //     "tag": "div",
        //     "props": {
        //         "class": "mylife-session-year"
        //     },
        //     "lang": "",
        //     "children": [{
        //         "tag": "p",
        //         "props": {
        //             "class": "mylife-session-year-num"
        //         },
        //         "lang": "",
        //         "children": ["2000"]
        //     }, {
        //         "tag": "div",
        //         "props": {
        //             "class": "mylife-session-year-box"
        //         },
        //         "lang": "",
        //         "children": []
        //     }]
        // }

        // {
        //     "tag": "div",
        //     "props": {
        //         "class": "mylife-session-month"
        //     },
        //     "lang": "",
        //     "children": [{
        //         "tag": "p",
        //         "props": {
        //             "class": "mylife-session-month-num"
        //         },
        //         "lang": "",
        //         "children": ["Jan"]
        //     }, {
        //         "tag": "div",
        //         "props": {
        //             "class": "mylife-session-month-box"
        //         },
        //         "lang": "",
        //         "children": []
        //     }]
        // }


        // {
        //     "tag": "div",
        //     "props": {
        //         "class": "mylife-session-days"
        //     },
        //     "lang": "",
        //     "children": [{
        //         "tag": "div",
        //         "props": {
        //             "class": "mylife-session-days-content"
        //         },
        //         "lang": "",
        //         "children": [{
        //             "tag": "p",
        //             "props": {},
        //             "lang": "",
        //             "children": ["test 1234 测试, thsi is a test, testting 123 哈哈哈哈 测试换行的效果哟"]
        //         }]
        //     }, {
        //         "tag": "p",
        //         "props": {
        //             "class": "mylife-session-days-num"
        //         },
        //         "lang": "",
        //         "children": ["12"]
        //     }]
        // }

        let old_MyLife = window.myTools.deepCopy(window.myData.about.contentExpand);
        const MyLifeData = await window.myTools.getJson("/Data/About/AboutMe/MyLife/MyLife.json");

        const yearList = [];
        Object.entries(MyLifeData).forEach(([year, DataYearly]) => {

            const monthList = [];
            Object.entries(DataYearly).forEach(([month, DataMonthly]) => {

                const dayList = [];
                for (let day of Object.keys(DataMonthly).sort()) {
                    let DataDaily = DataMonthly[day];

                    let ctxBg = DataDaily["img"] == "" ? "yellow" : `url(${DataDaily["img"]})`
                    dayList.push({
                        "tag": "div",
                        "props": {
                            "class": "mylife-session-days"
                        },
                        "lang": "",
                        "children": [{
                            "tag": "div",
                            "props": {
                                "class": "mylife-session-days-content",
                                "style": `background: ${ctxBg} center/contain no-repeat;`
                            },
                            "lang": "",
                            "children": [{
                                "tag": "p",
                                "props": {},
                                "lang": "",
                                "children": [DataDaily["ctx"][window.globalValues.language]]
                            }]
                        }, {
                            "tag": "p",
                            "props": {
                                "class": "mylife-session-days-num"
                            },
                            "lang": "",
                            "children": [day]
                        }]
                    });
                }

                monthList.push({
                    "tag": "div",
                    "props": {
                        "class": "mylife-session-month"
                    },
                    "lang": "",
                    "children": [{
                        "tag": "p",
                        "props": {
                            "class": "mylife-session-month-num"
                        },
                        "lang": "month",
                        "children": [month]
                    }, {
                        "tag": "div",
                        "props": {
                            "class": "mylife-session-month-box"
                        },
                        "lang": "",
                        "children": dayList
                    }]
                });
            });

            yearList.push({
                "tag": "div",
                "props": {
                    "class": "mylife-session-year"
                },
                "lang": "",
                "children": [{
                    "tag": "p",
                    "props": {
                        "class": "mylife-session-year-num"
                    },
                    "lang": "",
                    "children": [year]
                }, {
                    "tag": "div",
                    "props": {
                        "class": "mylife-session-year-box"
                    },
                    "lang": "",
                    "children": monthList
                }]
            });
        });

        window.myData.about.contentExpand.children[1].children[0].children = yearList;

        window.vDom.Patch(
            document.querySelector("#about_ExpandContent"),
            window.vDom.Diff(
                old_MyLife,
                window.myData.about.contentExpand
            )
        );
        window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

            if (!el) return;
            el.parentNode.removeChild(el)
        });
        window.globalValues.nodeToRemove = [];
    },

    closeClick: async ( 
        event
    ) => {

        const { e, targetContent } = event;

        await SeeChen_AboutPage_AboutMe[`close${targetContent}`]?.();

        document.querySelector("#about_ExpandContent").classList.remove("expanded");
        await new Promise(r => setTimeout(r, 1000));
        document.querySelector("#about_ExpandContent").classList.remove("expanded-loading");
    },

    click: async (
        event
    ) => {
        
        const { e } = event;

        if (e.target.classList.contains("session-children")) {
            
            document.querySelector("#box_LoadingAnimation").classList.add("waitToDisplay");
            await new Promise(r => setTimeout(r, 100));
            document.querySelector("#box_LoadingAnimation").classList.add("display");

            var targetContent = e.target.id.split("-")[1];
            var targetDetails = `/Layout/Webpages/About/Session/AboutMe/${e.target.id.split("-")[1]}.json`;

            console.log(targetDetails);
            targetDetails = await window.myTools.getJson(targetDetails);

            const template_AboutMe = await window.myTools.getJson("/Layout/Webpages/About/Session/AboutMe.json");
            const old_AboutMe = window.myTools.deepCopy(window.myData.about.contentExpand);

            window.myData.about.contentExpand = template_AboutMe;

            window.myData.about.contentExpand.children[1].children = targetDetails;

            window.vDom.Patch(
                document.querySelector("#about_ExpandContent"),
                window.vDom.Diff(
                    old_AboutMe,
                    window.myData.about.contentExpand
                )
            );
            window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

                if (!el) return;
                el.parentNode.removeChild(el)
            });
            window.globalValues.nodeToRemove = [];

            document.querySelector("#about_ExpandContent").classList.add("expanded-loading");
            await new Promise(r => setTimeout(r, 100));
            document.querySelector("#about_ExpandContent").classList.add("expanded");

            // console.log(targetContent);
            await SeeChen_AboutPage_AboutMe[`loading${targetContent}`]?.();

            document.querySelector("#aboutMe_Content_Close").addEventListener("click", (e) => {
                window.eventBus.emit("aboutMe_close", { e, targetContent });
            });

            document.querySelector("#box_LoadingAnimation").classList.remove("display");
            await new Promise(r => setTimeout(r, 600));
            document.querySelector("#box_LoadingAnimation").classList.remove("waitToDisplay");

        }
    }
}

const SeeChen_AboutPage_Acknowledgments = {

    closeClick: async (
        event
    ) => {

        const { e } = event;

        document.querySelector("#content_acknowledgments").scrollTo(0, 0);

        document.querySelector("#about_ExpandContent").classList.remove("expanded");
        await new Promise(r => setTimeout(r, 1000));
        document.querySelector("#content_acknowledgments > div:nth-child(2)").style.height = "";
        document.querySelector("#about_ExpandContent").classList.remove("expanded-loading");
    },

    click: async (
        event
    ) => {

        const { e } = event;

        if (e.target.classList.contains("session-children")) {

            document.querySelector("#box_LoadingAnimation").classList.add("waitToDisplay");
            await new Promise(r => setTimeout(r, 100));
            document.querySelector("#box_LoadingAnimation").classList.add("display");

            var targetDetails = `/Data/About/Acknowledgments/${e.target.dataset.eventHandle.split("-")[1]}.json`;
            targetDetails = await window.myTools.getJson(targetDetails);

            const template_Acknowledgments = await window.myTools.getJson("/Layout/Webpages/About/Session/Acknowledgments.json");
            const old_Acknowledgmenst = window.myTools.deepCopy(window.myData.about.contentExpand);
            
            window.myData.about.contentExpand = template_Acknowledgments;

            window.myData.about.contentExpand.children[0].children[0].props["src"] = targetDetails["background-pictures"];
            
            window.myData.about.contentExpand.children[1].children[0].props["src"] = targetDetails["profile-pictures"];
            window.myData.about.contentExpand.children[1].children[1].children = [e.target.dataset.originalObj];

            Object.keys(targetDetails.help_list).forEach(help_list => {

                if (targetDetails.help_list[help_list]) {
                    window.myData.about.contentExpand.children[3].children.push({
                        tag: "div",
                        props: {
                            "class": "acknowledgments-suggestion-border"
                        },
                        lang: "",
                        children: [{
                            tag: "p",
                            props: {
                                class: "acknowledgments-suggestion-subtitle"
                            },
                            lang: "about",
                            children: [`_acknowledgments_suggestion_subtitle_${help_list}_`]
                        }, {
                            tag: "p",
                            props: {
                                "class": "acknowledgments-suggestion-description"
                            },
                            lang: "about",
                            children: [`_acknowledgments_suggestion_description_${help_list}_`]
                        }]
                    });
                }
            });

            Object.keys(targetDetails.social_media).forEach(socialMedia => {

                window.myData.about.contentExpand.children[4].children.push({
                    tag: "a",
                    props: {
                        href: `${targetDetails.social_media[socialMedia]}`,
                        target: "_blank"
                    },
                    lang: "",
                    children: [{
                        tag: "img",
                        props: {
                            src: `/File/Icon/ico_${socialMedia}.png`
                        },
                        lang: "",
                        children: []
                    }]
                });
            });

            window.vDom.Patch(
                document.querySelector("#about_ExpandContent"),
                window.vDom.Diff(
                    old_Acknowledgmenst,
                    window.myData.about.contentExpand
                )
            );
            window.globalValues.nodeToRemove.forEach(({ parent, el }) => {

                if (!el) return;
                el.parentNode.removeChild(el)
            });
            window.globalValues.nodeToRemove = [];

            document.querySelector("#about_ExpandContent").classList.add("expanded-loading");
            await new Promise(r => setTimeout(r, 100));
            document.querySelector("#about_ExpandContent").classList.add("expanded");

            document.querySelector("#acknowledgments-btn-close").addEventListener("click", (e) => {
                window.eventBus.emit("acnkowledgments_close", { e });
            })

            document.querySelector("#content_acknowledgments > div:nth-child(2)").style.height = `${document.querySelector("#content_acknowledgments").scrollHeight}px`;

            document.querySelector("#box_LoadingAnimation").classList.remove("display");
            await new Promise(r => setTimeout(r, 600));
            document.querySelector("#box_LoadingAnimation").classList.remove("waitToDisplay");
        }
    }
}
