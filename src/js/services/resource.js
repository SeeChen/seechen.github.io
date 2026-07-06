/**
 * seechen.github.io
 * https://github.com/SeeChen/seechen.github.io
 *
 * Copyright (c) 2024-2026 LEE SEE CHEN. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * @fileoverview Resource loading service for SeeChen Website.
 */

import { logger } from '../util/logger.js';

const LOADED_STYLES = new Set();
const STYLE_LOADERS = new Map();
const MODULE_LOADERS = new Map();

/**
 * Validates a resource path.
 * @param {string} path
 */
function validatePath(path) {
    if (!path || typeof path !== 'string') {
        throw new TypeError('Resource path must be a non-empty string.');
    }
}

/**
 * Fetches a resource and checks the HTTP response status.
 * @param {string} path
 * @return {!Promise<!Response>}
 */
async function fetchResource(path) {
    validatePath(path);

    logger.debug(`Fetching resource: ${path}`);
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${path}. HTTP status: ${response.status}`);
    }

    return response;
}

export const SEECHEN_RESOURCE = {
    /**
     * Loads a JSON resource.
     * @param {string} path
     * @return {!Promise<*>}
     */
    async getJson(path) {
        try {
            const response = await fetchResource(path);
            return await response.json();
        } catch (error) {
            logger.error(`Failed to load JSON resource: ${path}`, error);
            throw error;
        }
    },

    /**
     * Loads a text resource.
     * @param {string} path
     * @return {!Promise<string>}
     */
    async getText(path) {
        try {
            const response = await fetchResource(path);
            return await response.text();
        } catch (error) {
            logger.error(`Failed to load text resource: ${path}`, error);
            throw error;
        }
    },

    /**
     * Loads a stylesheet once.
     * @param {string} path
     * @return {!Promise<void>}
     */
    loadStyle(path) {
        validatePath(path);

        // Prevent loading the same stylesheet after it has completed.
        if (LOADED_STYLES.has(path)) {
            logger.debug(`Stylesheet already loaded: ${path}`);
            return Promise.resolve();
        }

        // Reuse the same promise while the stylesheet is still loading.
        if (STYLE_LOADERS.has(path)) {
            logger.debug(`Stylesheet is already loading: ${path}`);
            return STYLE_LOADERS.get(path);
        }

        const loader = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            link.dataset.seechenResource = 'style';
            link.dataset.seechenPath = path;

            link.onload = () => {
                LOADED_STYLES.add(path);
                STYLE_LOADERS.delete(path);
                logger.debug(`Stylesheet loaded: ${path}`);
                resolve();
            };

            link.onerror = () => {
                STYLE_LOADERS.delete(path);
                link.remove();

                const error = new Error(`Failed to load stylesheet: ${path}`);
                logger.error(error.message);
                reject(error);
            };

            document.head.appendChild(link);
        });

        STYLE_LOADERS.set(path, loader);
        return loader;
    },

    /**
     * Loads an ES module once.
     * @param {string} path
     * @return {!Promise<!Object>}
     */
    loadModule(path) {
        validatePath(path);

        if (MODULE_LOADERS.has(path)) {
            logger.debug(`Module already requested: ${path}`);
            return MODULE_LOADERS.get(path);
        }

        logger.debug(`Loading module: ${path}`);
        const loader = import(path).catch((error) => {
            MODULE_LOADERS.delete(path);
            logger.error(`Failed to load module: ${path}`, error);
            throw error;
        });

        MODULE_LOADERS.set(path, loader);
        return loader;
    },
};
