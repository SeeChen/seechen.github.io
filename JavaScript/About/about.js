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
            var aboutSession = window.myTools.deepCopy(aboutSessionTemplate);

            aboutSession.props["data-event-handler"] = aboutSessionList[sessionTitle]["handle"];

            aboutSession.children[1].lang = "about";
            aboutSession.children[1].children = [sessionTitle];
            aboutSession.children[1].props["id"] = aboutSessionList[sessionTitle]["id"];

            Object.keys(aboutSessionList[sessionTitle]["children"]).forEach(sessionContent => {

                aboutSession.children[2].children.push({
                    tag: "span",
                    props: {
                        class: "session-children",
                        "data-event-handle": aboutSessionList[sessionTitle]["children"][sessionContent]["handle"]
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

                window.eventBus.emit(boxSession.dataset.eventHandler, { e });
            })
        });
    },

    registerEvents: async () => {

        const about_EventHandler = {

            sessionExpand: SeeChen_AboutPage_Session.expand_Content,

            aboutSession_Language: SeeChen_AboutPage_Language.click,
        }

        Object.entries(about_EventHandler).forEach(([event, handler]) => {

            window.eventBus.on(event, handler);
        });

    },

    clearUp: () => {

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

    click: (
        event
    ) => {

        const { e } = event;

        if (e.target.classList.contains("session-children")) {

            const language_Handle = e.target.dataset.eventHandle;
            
            var language = new userLanguage();
            language.switchLanguage(language_Handle.split("-")[1]);

            
        }
    }
}
