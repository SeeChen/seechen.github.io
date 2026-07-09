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
 * @fileoverview Layout repository for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { logger } from '../util/logger.js';
import { SEECHEN_RESOURCE } from '../services/resource.js';
import { isNonEmptyString } from '../util/type.js';

const LAYOUT_CACHE = new Map();

/**
 * Normalizes a registry key.
 * @param {string} name
 * @return {string}
 */
function normalizeLayoutName(name) {
    if (!isNonEmptyString(name)) {
        throw new TypeError('Layout name must be a non-empty string.');
    }

    return name.trim().toUpperCase();
}

/**
 * Gets a named path from a layout registry section.
 * @param {!Object} registry
 * @param {string} name
 * @param {string} type
 * @return {string}
 */
function getLayoutPath(registry, name, type) {
    const layoutName = normalizeLayoutName(name);
    const path = registry[layoutName];

    if (!isNonEmptyString(path)) {
        throw new Error(`Unknown ${type} layout: ${layoutName}`);
    }

    return path;
}

/**
 * Gets a component layout configuration.
 * @param {string} name
 * @return {!Object}
 */
function getComponentConfig(name) {
    const componentName = normalizeLayoutName(name);
    const config = SEECHEN_WEBPAGE_CONFIG.REGISTRY.COMPONENTS_LAYOUT[componentName];

    if (!config || !isNonEmptyString(config.PATH)) {
        throw new Error(`Unknown component layout: ${componentName}`);
    }

    return config;
}

/**
 * Loads and caches a layout JSON file.
 * @param {string} cacheKey
 * @param {string} path
 * @return {!Promise<!Object>}
 */
async function loadLayout(cacheKey, path) {
    if (LAYOUT_CACHE.has(cacheKey)) {
        logger.debug(`Layout already loaded: ${cacheKey}`);
        return LAYOUT_CACHE.get(cacheKey);
    }

    logger.debug(`Loading layout: ${cacheKey} (${path})`);
    const layout = await SEECHEN_RESOURCE.getJson(path);
    LAYOUT_CACHE.set(cacheKey, layout);
    return layout;
}

export const SEECHEN_LAYOUT = {
    /**
     * Loads a page or global layout.
     * @param {string} name
     * @return {!Promise<!Object>}
     */
    async getPageLayout(name) {
        const layoutName = normalizeLayoutName(name);
        const path = getLayoutPath(
            SEECHEN_WEBPAGE_CONFIG.REGISTRY.PAGES_LAYOUT,
            layoutName,
            'page',
        );

        return loadLayout(`page:${layoutName}`, path);
    },

    /**
     * Loads a component layout.
     * @param {string} name
     * @return {!Promise<!Object>}
     */
    async getComponentLayout(name) {
        const componentName = normalizeLayoutName(name);
        const config = getComponentConfig(componentName);
        return loadLayout(`component:${componentName}`, config.PATH);
    },

    /**
     * Gets the stylesheet path for a component layout.
     * @param {string} name
     * @return {string}
     */
    getComponentStylePath(name) {
        const config = getComponentConfig(name);
        return config.STYLE || '';
    },

    /**
     * Clears the in-memory layout cache.
     */
    clearCache() {
        // AI always Suggestion me to intergate
        // I don't think this is a good idea
        // because it will clear all the cache
        // which may cause performance issues.
        
        // This is intentionally kept for debugging and controlled resets only.
        // Clearing all layout cache during normal navigation can hurt performance.
        LAYOUT_CACHE.clear();
    },
};
