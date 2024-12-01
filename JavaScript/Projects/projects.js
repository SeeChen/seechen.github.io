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

            temp_ProjectBlock.props["id"] = pro.id;
            temp_ProjectBlock.props["data-id"] = `${pro.id}`;
            temp_ProjectBlock.props["data-name"] = `${pro.project_name}`;
            temp_ProjectBlock.props["style"] = `
                background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${pro.project_Img});
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            `

            projectsPageLayout.children[2].children.push(temp_ProjectBlock);
        });

        window.globalValues.currentVDom = projectsPageLayout;
        window.myData.projects.currentDetails = projectsPageLayout.children[3].children[0];
        
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

            projectGitCopy: SeeChen_ProjectsDetailsContentEvent.copyLink
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

            projectGitCopy: SeeChen_ProjectsDetailsContentEvent.copyLink
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
    mouseClick: async (
        event
    ) => {

        const { e } = event;

        if (e.target.classList.contains("project_border")) {

            // await window.router.route(`/projects/${e.target.dataset.id}/`, false);

            document.querySelector("#box_LoadingAnimation").classList.add("waitToDisplay");
            await new Promise(r => setTimeout(r, 100));
            document.querySelector("#box_LoadingAnimation").classList.add("display");

            var oldProjectDetails = window.myTools.deepCopy(window.myData.projects.currentDetails);

            window.myData.projects.currentDetails.children[0].children[1].lang = "projectName";
            window.myData.projects.currentDetails.children[0].children[1].children = [e.target.dataset.name];

            const Template_Intro = await window.myTools.getJson("/Layout/Webpages/Projects/Intro.json");
            const Template_Git = await window.myTools.getJson("/Layout/Webpages/Projects/Git.json");
            const Template_License = await window.myTools.getJson("/Layout/Webpages/Projects/License.json");
            const Template_Author = await window.myTools.getJson("/Layout/Webpages/Projects/Author.json");

            var targetGeneralContent = await window.myTools.getJson(`/Data/Projects/${e.target.id}/general.json`);

            // Intro
            var temp_Intro = window.myTools.deepCopy(Template_Intro);
            var content_Intro = await window.myTools.getTxt(`/File/Projects/${e.target.id}/Intro-${window.globalValues.language}.txt`);
            temp_Intro.children[1].children = [content_Intro];

            window.myData.projects.currentDetails.children[1].children[1].children[0].children = [temp_Intro];

            // Git
            window.myData.projects.currentDetails.children[1].children[1].children[1].children = [];
            if (targetGeneralContent["Git"].length > 0) {

                window.myData.projects.currentDetails.children[1].children[0].children[0].children[1].props["style"] = "display: initial;";

                targetGeneralContent["Git"].forEach(git =>  {

                    var temp_git = window.myTools.deepCopy(Template_Git);
    
                    temp_git.children[0].children[0].props["href"] = git.target_repo;
                    temp_git.children[0].children[0].children[0].props["src"] = `/File/Icon/ico_${git.sites}.png`;
    
                    temp_git.children[1].children[0].children[1].children = [git.https];
                    temp_git.children[1].children[0].children[2].props["data-link"] = [git.https];
    
                    temp_git.children[1].children[1].children[1].children = [git.ssh];
                    temp_git.children[1].children[1].children[2].props["data-link"] = [git.ssh];
    
                    temp_git.children[2].children[0].props["href"] = git.download;
    
                    temp_git.children[3].children[0].props["href"] = git.target_repo;
                    temp_git.children[3].children[0].children = [`_view_on_${git.sites}_`];
    
    
                    window.myData.projects.currentDetails.children[1].children[1].children[1].children.push(temp_git);
                });

            } else {
                window.myData.projects.currentDetails.children[1].children[0].children[0].children[1].props["style"] = "display: none;";
            }

            // License
            if (targetGeneralContent["License"] !== "--") {

                const licenseValues = {
                    "GNU_GPL-3.0": {
                        "name": "GNU GPL-3.0",
                        "link": "https://www.gnu.org/licenses/",
                        "oriTxt": "https://www.gnu.org/licenses/gpl-3.0.txt"
                    }
                }

                window.myData.projects.currentDetails.children[1].children[0].children[0].children[5].props["style"] = "display: initial;";

                var temp_License = window.myTools.deepCopy(Template_License[0]);
                var temp_License_Original = window.myTools.deepCopy(Template_License[2]);

                temp_License.children[1].children[1].props["href"] = licenseValues[targetGeneralContent["License"]]["link"];
                temp_License.children[1].children[1].children = [licenseValues[targetGeneralContent["License"]]["name"]];
                temp_License.children[2].children[1].props["href"] = licenseValues[targetGeneralContent["License"]]["link"];
                temp_License.children[2].children[1].children = [licenseValues[targetGeneralContent["License"]]["link"]];

                window.myData.projects.currentDetails.children[1].children[1].children[5].children.push(temp_License);
                if (window.globalValues.language !== "en") {
                    var temp_License_Translate = window.myTools.deepCopy(Template_License[1]);

                    temp_License_Translate.children[1].children[1].props["href"] = licenseValues[targetGeneralContent["License"]]["oriTxt"];

                    var License_Translate = await window.myTools.getTxt(`/File/Projects/License/${targetGeneralContent["License"]}-${window.globalValues.language}.txt`);
                    temp_License_Translate.children[2].children = [License_Translate];

                    window.myData.projects.currentDetails.children[1].children[1].children[5].children.push(temp_License_Translate);
                }

                var License_Original = await window.myTools.getTxt(`/File/Projects/License/${targetGeneralContent["License"]}-en.txt`);
                temp_License_Original.children[1].children = [License_Original];
                
                window.myData.projects.currentDetails.children[1].children[1].children[5].children.push(temp_License_Original);
            } else {
                window.myData.projects.currentDetails.children[1].children[0].children[0].children[5].props["style"] = "display: none;";
            }

            // Collaborator
            window.myData.projects.currentDetails.children[1].children[1].children[9].children = [];
            targetGeneralContent["Author"].forEach(author => {

                var temp_author = window.myTools.deepCopy(Template_Author);

                temp_author.children[0].children[0].props["src"] = author.image;
                temp_author.children[0].children[1].children = [author.name];

                temp_author.children[1].children[0].children = [author["location"][window.globalValues.language]];
                temp_author.children[1].children[1].children = [author["school"][window.globalValues.language]];
                temp_author.children[1].children[2].children = [author["company"][window.globalValues.language]];
                temp_author.children[1].children[3].children = [author["websites"]];
                temp_author.children[1].children[4].children = [author["github"]];
                temp_author.children[1].children[5].children = [author["email"]];

                temp_author.children[1].children[3].props["href"] = author["websites"];
                temp_author.children[1].children[4].props["href"] = author["github"];
                temp_author.children[1].children[5].props["href"] = `mailto:${author["email"]}`;

                window.myData.projects.currentDetails.children[1].children[1].children[9].children.push(temp_author);
            });

            await window.vDom.Patch(
                document.querySelector("div:has(> #project_details)"),
                window.vDom.Diff(
                    oldProjectDetails,
                    window.myData.projects.currentDetails
                )
            );

            document.querySelectorAll(".project_git_copy").forEach(obj => {
                obj.addEventListener("click", (e) => {
                    window.eventBus.emit("projectGitCopy", { e, obj });
                });
            });

            document.querySelector("#project_details").classList.add("ready-to-full");
            setTimeout(() => {
                document.querySelector("#project_details").classList.add("full-window");
            }, 100);

            document.querySelector("#box_LoadingAnimation").classList.remove("display");
            await new Promise(r => setTimeout(r, 600));
            document.querySelector("#box_LoadingAnimation").classList.remove("waitToDisplay");
        }
    }
}

const SeeChen_ProjectsDetailsMouseEvent = {

    closeClick: async (
        event
    ) => {

        // await window.router.route(`/projects/`, false);
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

const SeeChen_ProjectsDetailsContentEvent = {

    copyLink: async (
        event
    ) => {
        const { e, obj } = event;

        await navigator.clipboard.writeText(obj.dataset.link);
        alert("Link Copied! 链接已复制！");
    }
}
