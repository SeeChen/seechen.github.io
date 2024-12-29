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

        for (let idx = 0; idx < lines.length; idx++) {
            let line = lines[idx];

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

            if (content.startsWith("```")) {

                tempTree.tag = "code";

                while (!lines[++idx].includes("```")) {
                    tempTree.content += `</br>${lines[idx]}`.replaceAll(" ", "&nbsp;");
                }

                tempTree.content = tempTree.content.replace(/<\/br>/, "");
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

        const template = {
            tag: "tag",
            props: {},
            lang: "",
            children: []
        };

        let elementSpace = [];

        stateTree.forEach((leaf, i) => {
            
            let temp_vDOm = window.myTools.deepCopy(template);

            if (leaf.tag === "p" && leaf.content === "") {
                if (stateTree[i - 1]?.content === "" && stateTree[i - 1].tag ===  "p") {
                    return;
                }
                temp_vDOm.tag = "p";
                temp_vDOm.children = ["</br>"];
            }

            leaf.content = leaf.content.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2"/>')
                    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
                    .replace(/(^|[\s])\`(.*?)\`([\s]|$)/gim, `$1<code class="inline-code">$2</code>$3`);

            if (leaf.tag === "hr") {
                temp_vDOm.tag = "hr";
            }

            else if (leaf.tag.includes("h")) {
                temp_vDOm.tag = leaf.tag;
                temp_vDOm.children = [leaf.content];
            }

            else if (leaf.tag === "code") {
                temp_vDOm.tag = "code";
                temp_vDOm.children = [leaf.content];
            }

            else if (leaf.tag === "span") {

                const prepreviousLeaf = stateTree[i - 1];
                if (
                    prepreviousLeaf?.tag === "span" 
                    && prepreviousLeaf.content !== ""
                    && !prepreviousLeaf.ul.length
                    && !prepreviousLeaf.ol.length
                    && !prepreviousLeaf.subquote
                ) {
                    
                    vDomObj[vDomObj.length - 1].children[0] += `</br>${leaf.content}`;
                    return;
                }

                temp_vDOm.tag = "p";
                temp_vDOm.children = [leaf.content];
            }


            if (
                leaf.quote >= 0
                || leaf.subquote
                || leaf.ul.length
                || leaf.ol.length
            ) {
                let flag = false;
                const prepreviousLeaf = stateTree[i - 1];

                const tags = [
                    ...leaf.ul.map(num => ({tag: "ul", value: num})),
                    ...leaf.ol.map(num => ({tag: "ol", value: num.index})),
                    leaf.quote !== -1 ? {tag: "quote", value: leaf.quote} : null
                ].filter(item => item !== null);

                const sortedTags = tags.sort((a, b) => a.value - b.value);

                sortedTags.forEach(marked => {

                    if (marked.value === 0) {

                        let temp_children = window.myTools.deepCopy(temp_vDOm);

                        if (marked.tag === "quote") {
                            
                            if (leaf.subquote) {

                                vDomObj[vDomObj.length - 1].children.push({
                                    tag: "blockquote",
                                    props: {
                                        class: "subquote"
                                    },
                                    lang: "",
                                    children: [temp_children]
                                });

                                flag = true;
                            } else if (prepreviousLeaf.quote >= 0) {

                                vDomObj[vDomObj.length - 1].children.push(temp_children);

                                flag = true;
                            } else {

                                temp_vDOm.tag = "blockquote";
                                temp_vDOm.children = [temp_children];
                            }
                        } else if (marked.tag === "ul" || marked.tag === "ol") {

                            if (!elementSpace.includes(leaf.space)) {
                                elementSpace.push(leaf.space);
                                
                                elementSpace = elementSpace.sort((a, b) => { a - b });
                            }

                            if (leaf.space === Math.min(...elementSpace)) {
                                
                                if (
                                    !prepreviousLeaf.ol.length 
                                    && !prepreviousLeaf.ul.length
                                ) {

                                    temp_vDOm.tag = marked.tag;
                                    temp_vDOm.children = [{
                                        tag: "li",
                                        props: {},
                                        lang: "",
                                        children: [temp_children]
                                    }]
                                } else {

                                    vDomObj[vDomObj.length - 1].children.push({
                                        tag: "li",
                                        props: {},
                                        lang: "",
                                        children: [temp_children]
                                    });

                                    flag = true;
                                }
                            } else {

                                elementSpace.indexOf(leaf.space);
                            }
                        }
                    }
                });

                if (flag) {
                    return;
                }
            }

            vDomObj.push(temp_vDOm);
        });

        return vDomObj;
    }
}