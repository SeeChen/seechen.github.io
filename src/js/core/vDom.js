/**
 * seechen.github.io
 * https://github.com/SeeChen/seechen.github.io
 *
 * Copyright (C) 2024-2026 LEE SEE CHEN.
 *
 * This file is licensed under the GNU General Public License v3.0 (GPLv3).
 * You can redistribute it and/or modify it under the terms of the GPLv3.
 * For more details, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-only
 */

/**
 * @fileoverview Lightweight Virtual DOM for SeeChen Website.
 */

import { SEECHEN_I18N } from '../services/i18n-service.js';

/**
 * @typedef {Object} LayoutConfig
 * @property {string} tag
 * @property {!Object=} props
 * @property {string=} component
 * @property {string=} lang
 * @property {!Array<LayoutConfig|string>=} children
 */

/**
 * @typedef {Object} VNode
 * @property {string} tag
 * @property {!Object} props
 * @property {string} lang
 * @property {!Array<VNode|string>} children
 */

const COMPONENTS = {};
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Checks whether a value is a plain object.
 * @param {*} value
 * @return {boolean}
 */
function isObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

/**
 * Checks whether a value is a virtual node.
 * @param {*} value
 * @return {boolean}
 */
function isVNode(value) {
    return isObject(value) && typeof value.tag === 'string';
}

/**
 * Resolves the DOM namespace for an element.
 * @param {string} tag
 * @param {string=} currentNamespace
 * @return {string}
 */
function resolveDomNamespace(tag, currentNamespace = '') {
    if (tag === 'svg') {
        return SVG_NAMESPACE;
    }

    if (currentNamespace === SVG_NAMESPACE && tag !== 'foreignObject') {
        return SVG_NAMESPACE;
    }

    return '';
}

/**
 * Creates a DOM element with the correct namespace.
 * @param {string} tag
 * @param {string=} namespace
 * @return {!Element}
 */
function createDomElement(tag, namespace = '') {
    if (namespace) {
        return document.createElementNS(namespace, tag);
    }

    return document.createElement(tag);
}

/**
 * Gets the DOM namespace from a parent node.
 * @param {!Node} parent
 * @return {string}
 */
function getParentDomNamespace(parent) {
    return parent.namespaceURI === SVG_NAMESPACE ? SVG_NAMESPACE : '';
}

/**
 * Normalizes children into vNode-compatible values.
 * @param {!Array<LayoutConfig|string>} children
 * @return {!Array<VNode|string>}
 */
function createChildren(children) {
    return children.map((child) => {
        return typeof child === 'string' ? child : vDom.create(child);
    });
}

/**
 * Merges component and local props.
 * @param {!Object} componentProps
 * @param {!Object} localProps
 * @return {!Object}
 */
function mergeProps(componentProps, localProps) {
    const mergedProps = {
        ...componentProps,
        ...localProps,
    };

    if (componentProps.class && localProps.class) {
        const classNames = `${componentProps.class} ${localProps.class}`.split(/\s+/);
        mergedProps.class = [...new Set(classNames)].filter(Boolean).join(' ');
    }

    return mergedProps;
}

/**
 * Resolves a text key against the active i18n namespace.
 * @param {string} namespace
 * @param {string} value
 * @return {string}
 */
function resolveText(namespace, value) {
    if (!namespace) {
        return value;
    }

    return SEECHEN_I18N.t(namespace, value);
}

/**
 * Sets or removes a DOM property.
 * @param {!Element} element
 * @param {string} key
 * @param {*} value
 */
function setProp(element, key, value) {
    if (value === undefined || value === null || value === false) {
        element.removeAttribute(key);
        return;
    }

    if (key === 'className') {
        element.setAttribute('class', value);
        return;
    }

    if (value === true) {
        element.setAttribute(key, '');
        return;
    }

    element.setAttribute(key, String(value));
}

/**
 * Applies props to a DOM element.
 * @param {!Element} element
 * @param {!Object} props
 */
function renderProps(element, props) {
    Object.entries(props).forEach(([key, value]) => {
        setProp(element, key, value);
    });
}

/**
 * Creates prop patches.
 * @param {!Object} oldProps
 * @param {!Object} newProps
 * @return {!Array<!Object>}
 */
function diffProps(oldProps, newProps) {
    const propPatches = [];

    Object.entries(newProps).forEach(([key, value]) => {
        if (oldProps[key] !== value) {
            propPatches.push({ key, value });
        }
    });

    Object.keys(oldProps).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(newProps, key)) {
            propPatches.push({ key });
        }
    });

    return propPatches;
}

export const vDom = {
    components: COMPONENTS,

    /**
     * Registers a component layout.
     * @param {string} name
     * @param {!LayoutConfig} layout
     */
    registerComponent(name, layout) {
        COMPONENTS[name] = layout;
    },

    /**
     * Creates a virtual DOM tree from layout config.
     * @param {!LayoutConfig|string} layoutConfig
     * @return {VNode|string}
     */
    create(layoutConfig) {
        if (typeof layoutConfig === 'string') {
            return layoutConfig;
        }

        const {
            tag,
            props = {},
            component = '',
            lang = '',
            children = [],
        } = layoutConfig;

        if (!tag) {
            throw new TypeError('Layout config must include a tag.');
        }

        if (component && COMPONENTS[component]) {
            const componentLayout = COMPONENTS[component];
            const mergedProps = mergeProps(componentLayout.props || {}, props);
            const mergedChildren = [
                ...(componentLayout.children || []),
                ...children,
            ];

            return vDom.createElement(
                tag,
                mergedProps,
                lang || componentLayout.lang || '',
                createChildren(mergedChildren),
            );
        }

        return vDom.createElement(
            tag,
            props,
            lang,
            createChildren(children),
        );
    },

    /**
     * Creates a virtual DOM node.
     * @param {string} tag
     * @param {!Object=} props
     * @param {string=} lang
     * @param {!Array<VNode|string>=} children
     * @return {!VNode}
     */
    createElement(tag, props = {}, lang = '', children = []) {
        return {
            tag,
            props,
            lang,
            children,
        };
    },

    /**
     * Renders a virtual DOM node into a real DOM node.
     * @param {VNode|string} vNode
     * @param {string=} textNamespace
     * @param {string=} domNamespace
     * @return {!Node}
     */
    render(vNode, textNamespace = '', domNamespace = '') {
        if (typeof vNode === 'string') {
            return document.createTextNode(resolveText(textNamespace, vNode));
        }

        const nodeNamespace = resolveDomNamespace(vNode.tag, domNamespace);
        const childTextNamespace = vNode.lang || textNamespace;
        const element = createDomElement(vNode.tag, nodeNamespace);

        renderProps(element, vNode.props);

        vNode.children.forEach((child) => {
            element.appendChild(
                vDom.render(child, childTextNamespace, nodeNamespace),
            );
        });

        return element;
    },

    /**
     * Diffs two virtual DOM nodes.
     * @param {VNode|string|undefined} oldNode
     * @param {VNode|string|undefined} newNode
     * @param {string=} namespace
     * @return {!Array<!Object>}
     */
    diff(oldNode, newNode, namespace = '') {
        const patches = [];

        if (oldNode === undefined || newNode === undefined) {
            if (newNode !== undefined) {
                patches.push({ type: 'ADD', newNode });
            } else if (oldNode !== undefined) {
                patches.push({ type: 'REMOVE' });
            }

            return patches;
        }

        if (typeof oldNode === 'string' || typeof newNode === 'string') {
            if (oldNode !== newNode) {
                patches.push({
                    type: 'TEXT',
                    text: resolveText(namespace, String(newNode)),
                });
            }

            return patches;
        }

        if (!isVNode(oldNode) || !isVNode(newNode) || oldNode.tag !== newNode.tag) {
            patches.push({ type: 'REPLACE', newNode });
            return patches;
        }

        const propPatches = diffProps(oldNode.props, newNode.props);
        if (propPatches.length > 0) {
            patches.push({ type: 'PROPS', props: propPatches });
        }

        const childPatches = [];
        const maxChildrenLength = Math.max(
            oldNode.children.length,
            newNode.children.length,
        );

        for (let i = 0; i < maxChildrenLength; i++) {
            childPatches.push(
                vDom.diff(
                    oldNode.children[i],
                    newNode.children[i],
                    newNode.lang || namespace,
                ),
            );
        }

        patches.push({ type: 'CHILDREN', children: childPatches });
        return patches;
    },

    /**
     * Applies patches to real DOM.
     * @param {!Node} parent
     * @param {!Array<!Object>} patches
     * @param {number=} index
     */
    patch(parent, patches, index = 0) {
        const target = parent.childNodes[index];
        const domNamespace = getParentDomNamespace(parent);

        patches.forEach((patch) => {
            switch (patch.type) {
                case 'ADD':
                    parent.appendChild(vDom.render(patch.newNode, '', domNamespace));
                    break;

                case 'REMOVE':
                    if (target) {
                        parent.removeChild(target);
                    }
                    break;

                case 'TEXT':
                    if (target) {
                        target.textContent = patch.text;
                    }
                    break;

                case 'REPLACE':
                    if (target) {
                        parent.replaceChild(
                            vDom.render(patch.newNode, '', domNamespace),
                            target,
                        );
                    }
                    break;

                case 'PROPS':
                    if (target && target.nodeType === Node.ELEMENT_NODE) {
                        patch.props.forEach(({ key, value }) => {
                            setProp(target, key, value);
                        });
                    }
                    break;

                case 'CHILDREN':
                    if (target) {
                        patch.children.forEach((childPatch, childIndex) => {
                            const changesChildCount = childPatch.some((item) => {
                                return item.type === 'ADD' || item.type === 'REMOVE';
                            });

                            if (!changesChildCount) {
                                vDom.patch(target, childPatch, childIndex);
                            }
                        });

                        for (
                            let childIndex = patch.children.length - 1;
                            childIndex >= 0;
                            childIndex--
                        ) {
                            const childPatch = patch.children[childIndex];

                            if (childPatch.some((item) => item.type === 'REMOVE')) {
                                vDom.patch(target, childPatch, childIndex);
                            }
                        }

                        patch.children.forEach((childPatch, childIndex) => {
                            if (childPatch.some((item) => item.type === 'ADD')) {
                                vDom.patch(target, childPatch, childIndex);
                            }
                        });
                    }
                    break;
            }
        });
    },

    /**
     * Updates a rendered virtual DOM tree and returns the new tree.
     * @param {!Node} parent
     * @param {VNode|string|undefined} oldNode
     * @param {VNode|string} newNode
     * @param {number=} index
     * @return {VNode|string}
     */
    update(parent, oldNode, newNode, index = 0) {
        vDom.patch(parent, vDom.diff(oldNode, newNode), index);
        return newNode;
    },
};
