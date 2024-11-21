
export const SeeChen_LensPages = {

    init: async () => {

        await SeeChen_LensPages.render();
        SeeChen_LensPages.registerEvents();
        document.querySelector("#box_LensPages").style.opacity = 1;
    },

    render: async () => {

        var lensPageLayout = await window.myTools.getJson("/Layout/Webpages/Lens/Lens.json");
        var lensPortfolio = await window.myTools.getJson("/Layout/Webpages/Lens/Image.json");

        const pseudoToSet = [];
        
        Object.keys(lensPortfolio).forEach( work => {


            let currentWork = lensPortfolio[work];
            let currentBox = {
                tag: "div",
                props: {
                    class: "box_lens_section"
                },
                lang: "",
                children: []
            }

            pseudoToSet.push(currentWork.background);

            currentWork.img.forEach(pic => {
                currentBox.children.push({
                    tag: "div",
                    props: {
                        class: "lens_Section_Content"
                    },
                    lang: "",
                    children: [{
                        tag: "div",
                        props: {
                            class: "lens_Section_Content_Params"
                        },
                        lang: "",
                        children: [{
                            tag: "p",
                            props: {},
                            lang: "",
                            children: [`${pic.width} x ${pic.height}`]
                        }]
                    }, {
                        tag: "img",
                        props: {
                            src: `/File/Image/Lens/Image/${pic.src}`
                        },
                        lang: "",
                        children: []
                    }]
                });
            });

            currentBox.children.push({
                tag: "div",
                props: {
                    class: "lens_Section_Intro"
                },
                lang: "",
                children: [{
                    tag: "p",
                    props: {
                        class: "lens_Section_Title"
                    },
                    lang: "imageTitle",
                    children: [work]
                }, {
                    tag: "p",
                    props: {
                        class: "lens_Section_Desc"
                    },
                    lang: "imageDesc",
                    children: [work]
                }]
            });

            lensPageLayout.children.push(currentBox);
        });

        window.globalValues.currentVDom = lensPageLayout;
         
        document.querySelector("#box_contentArea").appendChild(
            window.vDom.Render(
                lensPageLayout
            )
        );

        const styleSheet = document.styleSheets[0];
        pseudoToSet.forEach((bg, i) => {

            styleSheet.insertRule(
                `#box_LensPages .box_lens_section:nth-child(${i + 2})::before {
                    background-image: url(/File/Image/Lens/Image/${bg});
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed !important;
                    background-repeat: no-repeat;
                    filter: blur(0.15em) grayscale(0.8) opacity(0.6);
                }`, 
                styleSheet.cssRules.length);
        });
    },

    registerEvents: () => {

    },

    clearUp: () => {

        document.querySelector("#contentArea").scrollTo(0, 0);

        const boxContent = document.querySelector("#box_contentArea");
        const lensContent = boxContent.querySelector("#box_LensPages");
        lensContent.style.opacity = 0;

        setTimeout(() => {
            boxContent.removeChild(lensContent);
        }, 1000);
    }
}