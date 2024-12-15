/* 
    File: md2vDom.js (https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/General/md2vDom.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/


export const Markdown2vDom = {

    // Markdown rules reference https://www.markdownguide.org/basic-syntax/

    getRealContent: (
        content
    ) => {

        const contentObj = content.split("-");

        return {
            lang: contentObj[1] ? contentObj[1] : "",
            content: contentObj[0]
        }
    },

    convert: (
        markdown
    ) => {

        const vDomObj = [];

        const lines = markdown.split("\n");
        let inParagraph = false;

        for(let line of lines) {

            line.trim();

            let vDomChildren = {}

            line = line.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
            line = line.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
            line = line.replace(/\*(.*?)\*/gim, '<em>$1</em>');

            line = line.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

            if (line.startsWith(">> ")) {
                
                line = line.replace(">> ", "");
            } else if (line.startsWith("> ")) {
                line = line.replace("> ", "");
            }

            if (/^###### (.*)/.test(line)) {
                inParagraph = false;

                var realContent = Markdown2vDom.getRealContent(line.replace(/^###### /, ''));

                vDomChildren = {
                    tag: "h6",
                    props: {},
                    lang: realContent.lang,
                    children: [realContent.content]
                };
            } else if (/^##### (.*)/.test(line)) {
                inParagraph = false;

                var realContent = Markdown2vDom.getRealContent(line.replace(/^##### /, ''));

                vDomChildren = {
                    tag: "h5",
                    props: {},
                    lang: realContent.lang,
                    children: [realContent.content]
                };
            } else if (/^#### (.*)/.test(line)) {
                inParagraph = false;

                var realContent = Markdown2vDom.getRealContent(line.replace(/^#### /, ''));

                vDomChildren = {
                    tag: "h4",
                    props: {},
                    lang: realContent.lang,
                    children: [realContent.content]
                };
            } else if (/^### (.*)/.test(line)) {
                inParagraph = false;

                var realContent = Markdown2vDom.getRealContent(line.replace(/^### /, ''));

                vDomChildren = {
                    tag: "h3",
                    props: {},
                    lang: realContent.lang,
                    children: [realContent.content]
                };
            } else if (/^## (.*)/.test(line)) {
                inParagraph = false;

                var realContent = Markdown2vDom.getRealContent(line.replace(/^## /, ''));

                vDomChildren = {
                    tag: "h2",
                    props: {},
                    lang: realContent.lang,
                    children: [realContent.content]
                };
            } else if (/^# (.*)/.test(line)) {
                inParagraph = false;

                var realContent = Markdown2vDom.getRealContent(line.replace(/^# /, ''));

                vDomChildren = {
                    tag: "h1",
                    props: {},
                    lang: realContent.lang,
                    children: [realContent.content]
                };
            }

            else if (line.length === 0) {
                inParagraph = false;
            } else if (line.length > 0) {

                if (inParagraph) {

                    const lastDom = vDomObj[vDomObj.length - 1];
                    if (lastDom.tag === "p") {
                        lastDom.children = [`${lastDom.children[0]}<br>${line}`]
                    }
                } else {

                    inParagraph = true;

                    var realContent = Markdown2vDom.getRealContent(line);

                    vDomChildren = {
                        tag: "p",
                        props: {
                            style: "color: red;"
                        },
                        lang: realContent.lang,
                        children: [realContent.content]
                    };
                }
            }

            if (Object.keys(vDomChildren).length > 0) {
                vDomObj.push(vDomChildren);
            }
        }

        return vDomObj;
    }
}