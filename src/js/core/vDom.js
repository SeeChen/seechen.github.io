/**
 * @fileoverview Lightweight Virtual DOM for seechen.github.io
 * Handles i18n resolution via window.globalValues.translateData.
 * 
 * @author LEE SEE CHEN
 * @license MIT
 */

import { SEECHEN_WEBPAGE_VALUES } from "./app-context.js";

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

const language = SEECHEN_WEBPAGE_VALUES.LANGUAGE.LANGUAGE;
const translateData = SEECHEN_WEBPAGE_VALUES.LANGUAGE.OBJECT;

/**
 * Lightweight Virtual DOM for seechen.github.io
 * Provides create, render, diff, and patch helpers.
 * 
 * @const {!Object}
 * @namespace
 */
export const vDom = {

    components: {},
    registerComponent: (name, layout) => {
        vDom.components[name] = layout;
    },

    /**
     * Creates a virtual DOM node tree from a layout config.
     * Resolving i18n strings via window.globalValues.translateData.
     * 
     * @param {!layoutConfig} layoutConfig
     * @returns {!vNode}
     */
    create: (layoutConfig) => {

        const { tag, props = {}, component = "", lang = "", children = [] } = layoutConfig;

        if (component && vDom.components[component]) {
            const compLayout = vDom.components[component];
            return vDom.createElement(
                tag,
                { ...(compLayout.props || {}), ...props },
                lang || compLayout.lang,
                [...(compLayout.children || []), ...children].map(child => {
                    return typeof child === "string" ? child : vDom.create(child);
                })
            );
        }

        return vDom.createElement(
            tag,
            props,
            lang,
            children.length === 1 && typeof children[0] === "string"
                ? [translateData[lang] ? translateData[lang][language][children[0]] : children[0]]
                : children.map(child => vDom.create(child))
        );
    },

    createElement: (
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

    render: (
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
                let text = translateData[vNode.lang] ? translateData[vNode.lang][language][child] || child : child;
                el.appendChild(document.createTextNode(text));
            } else {
                el.appendChild(vDom.render(child));
            }
        });

        return el;
    },

    diff: (
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

            let newText = translateData[lang] ? translateData[lang][language][newNode] || newNode : newNode;

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
                childPatch.push(vDom.diff(oldNode.children[i], newNode.children[i], newNode.lang));
            }
            patches.push({ type: "CHILDREN", children: childPatch });
        }

        return patches;
    },

    patch: (
        parent,
        patches,
        index = 0
    ) => {

        const el = parent.children[index];

        patches.forEach(patch => {
            switch (patch.type) {
                case "ADD":
                    parent.appendChild(vDom.render(patch.newNode));
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
                    parent.replaceChild(vDom.render(patch.newNode), el);
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
                        vDom.patch(el, childPatch, i);
                    });
                    break;
            }
        });
    }
}
