/**
 * @fileoverview Lightweight Virtual DOM for seechen.github.io
 * Handles i18n resolution via window.globalValues.translateData.
 * 
 * @author LEE SEE CHEN
 * @license MIT
 */

/**
 * @typedef  {Object} layoutConfig
 * @property {string} tag
 * @property {Object} props
 * @property {string} lang
 * @property {Array<layout|string>} children
 */

/**
 * @typedef {Object} vNode
 * @property {string} tag
 * @property {Object} props
 * @property {string} lang
 * @property {Array<vNode|string>} children
 */

/**
 * Lightweight Virtual DOM for seechen.github.io
 * Provides create, render, diff, and patch helpers.
 * 
 * @const {!Object}
 * @namespace
 */
export const vDom = {

    /**
     * Creates a virtual DOM node tree from a layout config.
     * Resolving i18n strings via window.globalValues.translateData.
     * 
     * @param {!layoutConfig} layoutConfig
     * @returns {!vNode}
     */
    create: (layoutConfig) => {

        const { tag, props = {}, lang = "", children = [] } = layoutConfig;

        let LanguageObj = window.globalValues.translateData;

        return vDom.CreateElement(
            tag,
            props,
            lang,
            children.length === 1 && typeof children[0] === "string"
                ? [LanguageObj[lang] ? LanguageObj[lang][window.globalValues.language][children[0]] : children[0]]
                : children.map(child => vDom.Create(child))
        );
    },

    CreateElement: (
        tag,
        props,
        lang,
        children
    ) => {

        return {
            tag,
            props: props || {},
            lang: lang || "",
            children: children || []
        }
    },

    Render: (
        vNode
    ) => {
        if (typeof vNode === "string") {
            return document.createTextNode(vNode);
        }

        const el = document.createElement(vNode.tag);
        for (const [key, value] of Object.entries(vNode.props)) {
            el.setAttribute(key, value);
        }

        vNode.children.forEach(child => {

            if (typeof child === "string") {
                let LanguageObj = window.globalValues.translateData;
                let text = LanguageObj[vNode.lang] ? LanguageObj[vNode.lang][window.globalValues.language][child] || child : child;
                el.appendChild(document.createTextNode(text));
            } else {
                el.appendChild(vDom.Render(child));
            }
        });

        return el;
    },

    Diff: (
        oldNode,
        newNode,
        lang
    ) => {
        const patches = [];

        if (oldNode === undefined || newNode === undefined) {

            if (newNode !== undefined) {
                patches.push({ type: "ADD", newNode });
            } else if (oldNode !== undefined) {
                patches.push({ type: "REMOVE" });
            }
        }

        else if (typeof oldNode === "string" && typeof newNode === "string") {

            let LanguageObj = window.globalValues.translateData;
            let newText = LanguageObj[lang] ? LanguageObj[lang][window.globalValues.language][newNode] || newNode : newNode;

            if (oldNode !== newNode) {
                patches.push({ type: "TEXT", text: newText });
            }
        }

        else if (oldNode.tag !== newNode.tag) {
            patches.push({ type: "REPLACE", newNode });
        }

        else {
            const propPatches = [];
            for (const [key, value] of Object.entries(newNode.props)) {
                if (oldNode.props[key] !== value) {
                    propPatches.push({ key, value });
                }
            }

            for (const key in oldNode.props) {
                if (!(key in newNode.props)) {
                    propPatches.push({ key });
                }
            }

            if (propPatches.length > 0) {
                patches.push({ type: "PROPS", props: propPatches })
            }

            const childPatch = []
            const maxChildrenLength = Math.max(oldNode.children.length, newNode.children.length);
            for (let i = 0; i < maxChildrenLength; i++) {
                childPatch.push(vDom.Diff(oldNode.children[i], newNode.children[i], newNode.lang));
            }
            patches.push({ type: "CHILDREN", children: childPatch });
        }

        return patches;
    },

    Patch: (
        parent,
        patches,
        index = 0
    ) => {

        const el = parent.children[index];

        patches.forEach(patch => {
            switch (patch.type) {
                case "ADD":
                    parent.appendChild(vDom.Render(patch.newNode));
                    break;
                case "REMOVE":
                    window.globalValues.nodeToRemove.push({
                        parent: parent.id,
                        el
                    });
                    break;
                case "TEXT":
                    parent.textContent = patch.text;
                    break;
                case "REPLACE":
                    parent.replaceChild(vDom.Render(patch.newNode), el);
                    break;
                case "PROPS":
                    patch.props.forEach(({ key, value }) => {
                        if (value === undefined) {
                            el.removeAttribute(key);
                        } else {
                            el.setAttribute(key, value);
                        }
                    });
                    break;
                case "CHILDREN":
                    patch.children.forEach((childPatch, i) => {
                        vDom.Patch(el, childPatch, i);
                    });
                    break;
            }
        });
    }
}
