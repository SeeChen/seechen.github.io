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

    generateStateTree: (
        markdown
    ) => {

        const stateTree = [];
        const treeTemplate = {
            space: 0,

            quote: -1,
            subquote: false,
            ol: [],
            ul: [],

            tag: "tag",
            content: ""
        };
        const lines = markdown.split("\n");

        for (let line of lines) {

            let tempTree = window.myTools.deepCopy(treeTemplate);

            var splitSpace  = line.match(/^(\s*)(\S.*)?/);
            let spaceLength = splitSpace[1].length;

            tempTree.space = spaceLength;

            if (splitSpace[2] === undefined) {

                tempTree.tag = "p";
                tempTree.content = "";
                stateTree.push(tempTree);
                continue;
            }

            let content = splitSpace[2];

            if (/^(?:[-*_]){3,}\s*$/.test(content.trim())) {
                tempTree.tag = "hr";
                tempTree.content = "";
                stateTree.push(tempTree);
                continue;
            }

            let specialResult = [];
            while (content) {
                const match = content.match(/^((?:[-*+]|(?:\d+|[a-zA-Z])\.)|(?:>+))(?!\s*\[.\])(?= )/);
                if (!match) {
                    break;
                }
                specialResult.push(match[0]);
                content = content.slice(match[0].length + 1);
            }

            if (specialResult.length > 0) {
                specialResult.forEach((symbol, i) => {

                    const symbolMatch = symbol.match(/^([-*+])|(\d+\.)|([a-zA-Z]\.)|([?:>+])/);

                    if (symbolMatch[1]) {
                        tempTree.ul.push(i);
                    } else if (symbolMatch[2]) {
                        tempTree.ol.push({
                            index: i,
                            type: "NUMBER"
                        });
                    } else if (symbolMatch[3]) {
                        tempTree.ol.push({
                            index: i,
                            type: "LETTER"
                        });
                    } else if (symbolMatch[4]) {
                        tempTree.quote = i;
                        tempTree.subquote = (symbol.length === 2)
                    }
                });
            }

            let headerTag = content.match(/^(?:#+) /);
            if (headerTag) {
                tempTree.tag = `h${headerTag[0].length - 1}`;
                content = content.replace(/^(?:#+) /, "");
            }

            else {
                tempTree.tag = "span";
            }

            tempTree.content = content;
            stateTree.push(tempTree);
        }

        return stateTree;
    },

    convert: (
        markdown
    ) => {

        const stateTree = Markdown2vDom.generateStateTree(markdown);
        const vDomObj = [];

        console.log(stateTree);

        const template = {
            tag: "tag",
            props: {},
            lang: "",
            children: []
        };

        stateTree.forEach((leaf, i) => {
            console.log(leaf);
            let temp_vDOm = window.myTools.deepCopy(template);

            if (leaf.tag === "p" && leaf.content === "") {
                if (stateTree[i - 1] && stateTree[i - 1].content === "") {
                    console.log(i);
                    return;
                }
                temp_vDOm.tag = "p";
                temp_vDOm.children = [];
            }

            leaf.content = leaf.content.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2"/>')
                    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')

            if (leaf.tag === "hr") {
                temp_vDOm.tag = "hr";
            }

            else if (leaf.tag.includes("h")) {
                temp_vDOm.tag = leaf.tag;
                temp_vDOm.children = [leaf.content];
            }

            temp_vDOm.children = [leaf.content];

            vDomObj.push(temp_vDOm);
        });
        // const lines = markdown.split("\n");

        // const template = {
        //     tag: "tag",
        //     props: {},
        //     lang: "",
        //     children: []
        // };

        // let push = true;
        // let listObj = [];
        // let init_vDom = window.myTools.deepCopy(template);

        // for (let i = 0; i < lines.length; i++) {

        //     var line = lines[i];

        //     if (/^( *)- /.test(line)) {

        //         var match = line.match(/^( *)- /);
        //         line = line.replace(/^( *)- /, "");

        //         listObj.push({
        //             listType: "ul",
        //             space: match[0].length
        //         });
        //         push = !/^( *)- /.test(lines[i + 1]);
        //     }

        //     line = line.trim();

        //     if ((line === "---" || line === "***") 
        //             && (i - 1) > 0 && (i + 1) < lines.length
        //             && lines[i - 1].trim() === ""
        //             && lines[i + 1].trim() === ""
        //         ) {
        //         init_vDom.tag = "hr";
        //         line = "";
        //     }

        //     line = line.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
        //                 .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        //                 .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        //                 .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2"/>')
        //                 .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')

        //     if (line.startsWith(">> ") || line.startsWith("> ")) {
        //         line = line.replace("> ", "");

        //         if (push) {
        //             init_vDom.tag = "blockquote";
        //         }

        //         if ((i + 1) < lines.length) {
        //             var nextLine = lines[i + 1].trim();
        //             push = !nextLine.startsWith("> ");
        //         }
        //     }

        //     if (line.startsWith("#")) {
        //         for (let level of [6, 5, 4, 3, 2, 1]) {
        //             const headingMarker = "#".repeat(level) + " ";
        //             if (line.startsWith(headingMarker)) {
        //                 line = line.replace(headingMarker, "");
        //                 const headingTag = `h${level}`;
                
        //                 if (init_vDom.tag === "tag") {
        //                     init_vDom.tag = headingTag;
        //                     init_vDom.children = [line];
        //                 } else {
        //                     const tempDom = window.myTools.deepCopy(template);
        //                     tempDom.tag = headingTag;
        //                     tempDom.children = [line];
        //                     init_vDom.children.push(tempDom);
        //                 }
        //                 break;
        //             }
        //         }
        //     }
            
        //     else {
        //         if (line === "") {
        //             // NOTHING TODO
        //         } else if (
        //             vDomObj.length !== 0
        //                 && lines[i - 1].trim() !== ""
        //                 && vDomObj[vDomObj.length - 1].tag === "p"
        //                 && init_vDom.tag === "tag"
        //                 && push
        //         ) {
        //             vDomObj[vDomObj.length - 1].children[0] += `</br>${line}`;
        //         } else if (init_vDom.tag !== "tag") {
        //             var temp = window.myTools.deepCopy(template);
        //             temp.tag = "p";
        //             temp.children = [line];
        //             init_vDom.children.push(temp);
        //         } else {
        //             init_vDom.tag = "p";
        //             init_vDom.children = [line];
        //         }
        //     }

        //     // console.log(init_vDom);
        //     if (push && init_vDom.tag !== "tag") {
        //         vDomObj.push(init_vDom);
        //         init_vDom = window.myTools.deepCopy(template);
        //     }
        // }

        return vDomObj;
    }
}