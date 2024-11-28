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

    },

    bindEvent: async () => {

        document.querySelector("#box_projectsPage > div:nth-child(3)").addEventListener("mousemove", (e) => {

            window.eventBus.emit("projectMouseMove", { e });
        });

        document.querySelector("#box_projectsPage > div:nth-child(3)").addEventListener("mouseover", (e) => {

            window.eventBus.emit("projectMouseEnter", { e });
        });

        document.querySelector("#box_projectsPage > div:nth-child(3)").addEventListener("mouseout", (e) => {

            window.eventBus.emit("projectMouseLeave", { e });
        });
    },

    registerEvent: async () => {

        const projects_EvnetHandler = {

            projectMouseMove: SeeChen_ProjectsMouseEvent.mouseMove,
            projectMouseEnter: SeeChen_ProjectsMouseEvent.mouseEnter,
            projectMouseLeave: SeeChen_ProjectsMouseEvent.mouseLeave,
        }

        Object.entries(projects_EvnetHandler).forEach(([event, handler]) => {

            window.eventBus.on(event, handler);
        });
    },

    clearUp: () => {

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
    mouseClick: () => {}
}
