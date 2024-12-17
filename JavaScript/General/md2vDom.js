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
        let vDom_Children = {};
        let isPush = true;

        for (let i = 0; i < lines.length; i++) {

            let line = lines[i].trim();

            line = line.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')

                .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

            if (line.startsWith(">> ") || line.startsWith("> ")) {

                line.replace("> ", "");
                vDom_Children = {
                    tag: "blockquote",
                    props: {},
                    lang: "",
                    children: []
                };

                if (i < lines.length - 1 && lines[i + 1].trim().startsWith("> ")) {
                    isPush = false;
                } else {
                    isPush = true;
                }
            }

            if (/^###### (.*)/.test(line)) {
                line = line.replace(/^###### /, "");

                if (isPush) {

                }
            }

            console.log(vDom_Children);

            if (isPush && Object.keys(vDom_Children).length > 0) {
                vDomObj.push(vDom_Children);
                vDom_Children = {}
            }
        }

        return vDomObj;
    }
}