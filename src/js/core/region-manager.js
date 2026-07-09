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
 * @fileoverview Region rendering manager for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { SEECHEN_WEBPAGE_CONTEXT } from './app-context.js';
import { isNonEmptyString } from '../util/type.js';
import { vDom } from './vDom.js';

/**
 * Normalizes a region name.
 * @param {string} regionName
 * @return {string}
 */
function normalizeRegionName(regionName) {
    if (!isNonEmptyString(regionName)) {
        throw new TypeError('Region name must be a non-empty string.');
    }

    return regionName.trim().toUpperCase();
}

/**
 * Gets region config by region name.
 * @param {string} regionName
 * @return {!Object}
 */
function getRegionConfig(regionName) {
    const normalizedRegionName = normalizeRegionName(regionName);
    const regionConfig = SEECHEN_WEBPAGE_CONFIG.APP_SHELL.REGIONS[normalizedRegionName];

    if (!regionConfig || !isNonEmptyString(regionConfig.SELECTOR)) {
        throw new Error(`Unknown region config: ${normalizedRegionName}`);
    }

    return regionConfig;
}

/**
 * Gets a region root element.
 * @param {string} regionName
 * @return {!Element}
 */
function getRegionElement(regionName) {
    const normalizedRegionName = normalizeRegionName(regionName);
    const regionConfig = getRegionConfig(normalizedRegionName);
    const root = document.querySelector(regionConfig.SELECTOR);

    if (!root) {
        throw new Error(`Region root element not found: ${regionConfig.SELECTOR}`);
    }

    SEECHEN_WEBPAGE_CONTEXT.REGIONS.ELEMENTS[normalizedRegionName] = root;
    return root;
}

/**
 * Shows a region root.
 * @param {!Element} root
 */
function showRegion(root) {
    root.classList.remove('notInDisplay');
}

/**
 * Hides a region root when it is configured to hide while empty.
 * @param {string} regionName
 * @param {!Element} root
 */
function hideRegionWhenEmpty(regionName, root) {
    const regionConfig = getRegionConfig(regionName);

    if (regionConfig.HIDE_WHEN_EMPTY) {
        root.classList.add('notInDisplay');
    }
}

export const SEECHEN_REGION_MANAGER = {
    /**
     * Gets a region root element.
     * @param {string} regionName
     * @return {!Element}
     */
    getRoot(regionName) {
        return getRegionElement(regionName);
    },

    /**
     * Renders a virtual DOM tree into a region.
     * @param {string} regionName
     * @param {import('./vDom.js').VNode|string} regionVDom
     * @return {!Node}
     */
    render(regionName, regionVDom) {
        const normalizedRegionName = normalizeRegionName(regionName);
        const root = getRegionElement(normalizedRegionName);
        const element = vDom.render(regionVDom);

        root.replaceChildren(element);
        showRegion(root);
        SEECHEN_WEBPAGE_CONTEXT.REGIONS.CURRENT_VDOM[normalizedRegionName] = regionVDom;

        return element;
    },

    /**
     * Updates a region with virtual DOM diffing.
     * @param {string} regionName
     * @param {import('./vDom.js').VNode|string} nextVDom
     * @return {import('./vDom.js').VNode|string}
     */
    update(regionName, nextVDom) {
        const normalizedRegionName = normalizeRegionName(regionName);
        const root = getRegionElement(normalizedRegionName);
        const currentVDom =
            SEECHEN_WEBPAGE_CONTEXT.REGIONS.CURRENT_VDOM[normalizedRegionName];

        if (currentVDom === undefined) {
            this.render(normalizedRegionName, nextVDom);
            return nextVDom;
        }

        vDom.update(root, currentVDom, nextVDom);
        showRegion(root);
        SEECHEN_WEBPAGE_CONTEXT.REGIONS.CURRENT_VDOM[normalizedRegionName] =
            nextVDom;

        return nextVDom;
    },

    /**
     * Replaces a region with a DOM node.
     * @param {string} regionName
     * @param {!Node} element
     */
    replace(regionName, element) {
        const normalizedRegionName = normalizeRegionName(regionName);
        const root = getRegionElement(normalizedRegionName);

        root.replaceChildren(element);
        showRegion(root);
        delete SEECHEN_WEBPAGE_CONTEXT.REGIONS.CURRENT_VDOM[normalizedRegionName];
    },

    /**
     * Clears a region.
     * @param {string} regionName
     */
    clear(regionName) {
        const normalizedRegionName = normalizeRegionName(regionName);
        const root = getRegionElement(normalizedRegionName);

        root.replaceChildren();
        hideRegionWhenEmpty(normalizedRegionName, root);
        delete SEECHEN_WEBPAGE_CONTEXT.REGIONS.CURRENT_VDOM[normalizedRegionName];
    },
};
