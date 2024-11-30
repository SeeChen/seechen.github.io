/* 
    File: projects.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/Projects/projects.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/


export const SeeChen_ProjectsPage = {

    init: async () => {

        await SeeChen_ProjectsPage.render();
        await SeeChen_ProjectsPage.bindEvent();

        await SeeChen_ProjectsPage.registerEvent();

        document.querySelector("#box_projectsPage").style.opacity = 1;
    },

    render: async () => {
        var projectsPageLayout = await window.myTools.getJson("/Layout/Webpages/Projects/Projects.json");
        var projectsList = await window.myTools.getJson("/Data/Projects/ProjectsList.json")

        var Template_ProjectBlock = await window.myTools.getJson("/Layout/Webpages/Projects/Project.json");
        projectsList.forEach(pro => {

            var temp_ProjectBlock = window.myTools.deepCopy(Template_ProjectBlock);

            temp_ProjectBlock.children[0].children[0].children = [pro.project_name];
            pro.project_labels.forEach(label => {
                temp_ProjectBlock.children[0].children[1].children.push({
                    tag: "span",
                    props: {},
                    lang: "projectLabel",
                    children: [label]
                });
            })

            Object.keys(pro.project_repo).forEach((repo, i) => {

                if (pro.project_repo[repo] === "" || pro.project_repo[repo] === "none") {

                    temp_ProjectBlock.children[1].children[i].props["style"] = "display: none;"
                } else {
                    temp_ProjectBlock.children[1].children[i].props["href"] = pro.project_repo[repo];
                }
            });

            if (pro.project_license === "none") {
                temp_ProjectBlock.children[2].props["style"] = "display: none;";
            } else {
                temp_ProjectBlock.children[2].children[1].children = [pro.project_license];
            }

            temp_ProjectBlock.props["style"] = `
                background: url(${pro.project_Img});
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            `

            projectsPageLayout.children[2].children.push(temp_ProjectBlock);
        });

        window.globalValues.currentVDom = projectsPageLayout;
        document.querySelector("#box_contentArea").appendChild(
            window.vDom.Render(
                projectsPageLayout
            )
        );
    },

    bindEvent: async () => {

        document.querySelector("#box_projectsPage > div:nth-child(3)").addEventListener("click", (e) => {

            window.eventBus.emit("projectMouseClick", { e });
        });

        document.querySelector("#box_projectsPage > div:nth-child(3)").addEventListener("mousemove", (e) => {

            window.eventBus.emit("projectMouseMove", { e });
        });

        document.querySelector("#box_projectsPage > div:nth-child(3)").addEventListener("mouseover", (e) => {

            window.eventBus.emit("projectMouseEnter", { e });
        });

        document.querySelector("#box_projectsPage > div:nth-child(3)").addEventListener("mouseout", (e) => {

            window.eventBus.emit("projectMouseLeave", { e });
        });

        document.querySelector("#project_details_header > p:first-child").addEventListener("click", (e) => {

            window.eventBus.emit("projectDetailsCloseClick", { e });
        });

        document.querySelectorAll(".dir_title").forEach(ele => {
            ele.addEventListener("click", (e) => {

                window.eventBus.emit("projectDetailsDirExpand", { e });
            });
        });

        document.querySelector("#project_details_directory").addEventListener("click", (e) => {

            window.eventBus.emit("projectDetailsDirClick", { e });
        });
    },

    registerEvent: async () => {

        const projects_EvnetHandler = {

            projectMouseMove: SeeChen_ProjectsMouseEvent.mouseMove,
            projectMouseEnter: SeeChen_ProjectsMouseEvent.mouseEnter,
            projectMouseLeave: SeeChen_ProjectsMouseEvent.mouseLeave,
            projectMouseClick: SeeChen_ProjectsMouseEvent.mouseClick,

            projectDetailsCloseClick: SeeChen_ProjectsDetailsMouseEvent.closeClick,

            projectDetailsDirExpand: SeeChen_ProjectsDetailsDirEvent.expandDir,
            projectDetailsDirClick: SeeChen_ProjectsDetailsDirEvent.clickDir,
        }

        Object.entries(projects_EvnetHandler).forEach(([event, handler]) => {

            window.eventBus.on(event, handler);
        });

        let isTouchScreen = 'ontouchstart' in window;

        if (isTouchScreen || true) {
            const projects_EvnetHandler = {
        
                projectMouseMove: SeeChen_ProjectsMouseEvent.mouseMove,
                projectMouseEnter: SeeChen_ProjectsMouseEvent.mouseEnter,
                projectMouseLeave: SeeChen_ProjectsMouseEvent.mouseLeave,
            }
    
            Object.entries(projects_EvnetHandler).forEach(([event, handler]) => {
    
                window.eventBus.off(event, handler);
            });
        }
    },

    clearUp: () => {

        const projects_EvnetHandler = {
        
            projectMouseMove: SeeChen_ProjectsMouseEvent.mouseMove,
            projectMouseEnter: SeeChen_ProjectsMouseEvent.mouseEnter,
            projectMouseLeave: SeeChen_ProjectsMouseEvent.mouseLeave,
            projectMouseClick: SeeChen_ProjectsMouseEvent.mouseClick,

            projectDetailsCloseClick: SeeChen_ProjectsDetailsMouseEvent.closeClick,

            projectDetailsDirExpand: SeeChen_ProjectsDetailsDirEvent.expandDir,
            projectDetailsDirClick: SeeChen_ProjectsDetailsDirEvent.clickDir,
        }

        Object.entries(projects_EvnetHandler).forEach(([event, handler]) => {

            window.eventBus.off(event, handler);
        });

        document.querySelector("#contentArea").scrollTo(0, 0);

        const boxContent = document.querySelector("#box_contentArea");
        const homeContent = boxContent.querySelector("#box_projectsPage");
        homeContent.style.opacity = 0;

        setTimeout(() => {
            boxContent.removeChild(homeContent);
        }, 1000);
    }
}

const SeeChen_ProjectsMouseEvent = {

    mouseMove: (
        event
    ) => {
        const { e } = event;

        const project_Details = document.querySelector("#project_details");
        const project_Details_w = project_Details.offsetWidth;
        const project_Details_h = project_Details.offsetHeight;

        const windowH = window.innerHeight;
        const windowW = window.innerWidth;

        const currentX = e.clientX;
        const currentY = e.clientY;

        if (currentX + project_Details_w >= windowW) {

            document.documentElement.style.setProperty("--project-Details-left", `${currentX - project_Details_w}px`);
        } else {

            document.documentElement.style.setProperty("--project-Details-left", `${currentX}px`);
            document.documentElement.style.setProperty("--project-Details-right", `auto`);
        }

        if (currentY + project_Details_h >= windowH) {
            document.documentElement.style.setProperty("--project-Details-top", `${currentY - project_Details_h}px`);
        } else {

            document.documentElement.style.setProperty("--project-Details-top", `${currentY}px`);
        }
    },

    mouseEnter: (
        event
    ) => {

        const { e } = event;

        if (e.target.classList.contains("project_border")) {

            document.querySelector("#project_details").classList.add("small-window");
            
        }
    },
    mouseLeave: (
        event
    ) => {
        const { e } = event;

        if (e.target.classList.contains("project_border")) {

            document.querySelector("#project_details").classList.remove("small-window");
        }
    },
    mouseClick: (
        event
    ) => {

        const { e } = event;

        if (e.target.classList.contains("project_border")) {

            if ('ontouchstart' in window) {
                document.documentElement.requestFullscreen();
            }

            document.querySelector("#project_details").classList.add("ready-to-full");
            setTimeout(() => {
                document.querySelector("#project_details").classList.add("full-window");
            }, 100);
        }
    }
}

const SeeChen_ProjectsDetailsMouseEvent = {

    closeClick: (
        event
    ) => {

        document.querySelector("#project_details").classList.remove("full-window");
        setTimeout(() => {
            document.querySelector("#project_details").classList.remove("ready-to-full");
        }, 600);
    }
}

const SeeChen_ProjectsDetailsDirEvent = {

    expandDir: (
        event
    ) => {

        const { e } = event;

        e.target.classList.toggle("expand");
        console.log("click")
    },

    clickDir: (
        event
    ) => {

        const { e } = event;

        if (e.target.classList.contains("details_Dir_option")) {

            document.querySelector(".content-display").classList.remove("content-display");
            
            const targetDiv = `box_Projects_${e.target.id.split("_")[1]}`;
            document.querySelector(`#${targetDiv}`).classList.add("content-display");
        }
    }
}
