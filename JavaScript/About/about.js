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
            aboutSession_Acknowledgments_Click: SeeChen_AboutPage_Acknowledgments.click,
            
            aboutSites_close: SeeChen_AboutPage_AboutSites.closeClick,
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
            aboutSession_Acknowledgments_Click: SeeChen_AboutPage_Acknowledgments.click,
            
            aboutSites_close: SeeChen_AboutPage_AboutSites.closeClick,
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

            var test_md = `
            # 1
            ## 2
            ### 3
            #### 4
            ##### 5
            ###### 6

            ##test
            
            > ## inline 1
            >> subquote

            > ### inline 1-1
            > ### inline 1-2

            1. Order list
            2. Order list
            4. Hei Hei

            a. test
            b. test

            A. aaa
            B. aaa

            ---

            *em*
            **strong**
            ***em and strong***

            ***

            this is a paragraph

            this is frist row
            this is second row

            - [ ] a
            - [x] b

            - test for unorder list
            - aaa
                - aaabbb
                - aaaccc
            - bbb
            - ccc
                - cccaaa

            > - a
            > - b

            ![test image](/File/Image/Home/home-background.avif)
            [test](https://github.com)
            `
            window.myData.about.contentExpand.children[1].children = window.md2vDom.convert(test_md);

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
