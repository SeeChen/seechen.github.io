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
 * @fileoverview Resource loading service for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { logger } from '../util/logger.js';

const LOADED_STYLES = new Set();
const STYLE_LOADERS = new Map();
const MODULE_LOADERS = new Map();
const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

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
 * Checks whether a value is a plain object.
 * @param {*} value
 * @return {boolean}
 */
function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value === 'object' &&
        Object.getPrototypeOf(value) === Object.prototype,
    );
}

/**
 * Checks whether a resource path is absolute.
 * @param {string} path
 * @return {boolean}
 */
function isAbsoluteUrl(path) {
    return ABSOLUTE_URL_PATTERN.test(path);
}

/**
 * Appends query parameters to a URL.
 * @param {!URL} url
 * @param {!Object=} query
 */
function appendQuery(url, query = {}) {
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                url.searchParams.append(key, String(item));
            });
            return;
        }

        url.searchParams.set(key, String(value));
    });
}

/**
 * Creates the final request URL for static and API resources.
 * @param {string} path
 * @param {!Object=} query
 * @param {string=} baseUrl
 * @return {string}
 */
function createResourceUrl(path, query = {}, baseUrl = '') {
    validatePath(path);

    const trimmedPath = path.trim();
    const resolvedBaseUrl = baseUrl || '';
    const urlBase = resolvedBaseUrl || window.location.origin;
    const url = new URL(
        trimmedPath,
        isAbsoluteUrl(trimmedPath) ? window.location.href : urlBase,
    );

    appendQuery(url, query);

    if (resolvedBaseUrl || isAbsoluteUrl(trimmedPath)) {
        return url.href;
    }

    return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Creates an abort signal for request timeout and caller cancellation.
 * @param {?AbortSignal=} signal
 * @param {number=} timeoutMs
 * @return {{signal: ?AbortSignal, cleanup: function(): void}}
 */
function createRequestSignal(
    signal = null,
    timeoutMs = SEECHEN_WEBPAGE_CONFIG.API.TIMEOUT_MS,
) {
    if (!signal && !timeoutMs) {
        return {
            signal: null,
            cleanup() {},
        };
    }

    const controller = new AbortController();
    let timeoutId = null;

    const abortRequest = () => {
        controller.abort();
    };

    if (signal) {
        if (signal.aborted) {
            controller.abort();
        } else {
            signal.addEventListener('abort', abortRequest, { once: true });
        }
    }

    if (timeoutMs > 0) {
        timeoutId = window.setTimeout(abortRequest, timeoutMs);
    }

    return {
        signal: controller.signal,
        cleanup() {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }

            if (signal) {
                signal.removeEventListener('abort', abortRequest);
            }
        },
    };
}

/**
 * Normalizes fetch options before sending the request.
 * @param {!Object} options
 * @return {!Object}
 */
function createFetchOptions(options) {
    const headers = new Headers(options.headers || {});
    let body = options.body;

    if (isPlainObject(body)) {
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        body = JSON.stringify(body);
    }

    return {
        ...options,
        headers,
        body,
    };
}

/**
 * Fetches a resource and checks the HTTP response status.
 * @param {string} path
 * @param {!Object=} options
 * @return {!Promise<!Response>}
 */
async function fetchResource(path, options = {}) {
    const {
        baseUrl = '',
        query = {},
        timeoutMs = SEECHEN_WEBPAGE_CONFIG.API.TIMEOUT_MS,
        ...fetchOptions
    } = options;
    const url = createResourceUrl(path, query, baseUrl);
    const requestSignal = createRequestSignal(fetchOptions.signal || null, timeoutMs);
    const normalizedOptions = createFetchOptions({
        ...fetchOptions,
        signal: requestSignal.signal || undefined,
    });

    logger.debug(`Fetching resource: ${url}`);

    try {
        const response = await fetch(url, normalizedOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}. HTTP status: ${response.status}`);
        }

        return response;
    } finally {
        requestSignal.cleanup();
    }
}

export const SEECHEN_RESOURCE = {
    /**
     * Requests a resource and returns the raw HTTP response.
     * @param {string} path
     * @param {!Object=} options
     * @return {!Promise<!Response>}
     */
    request(path, options = {}) {
        return fetchResource(path, options);
    },

    /**
     * Loads a JSON resource.
     * @param {string} path
     * @param {!Object=} options
     * @return {!Promise<*>}
     */
    async getJson(path, options = {}) {
        try {
            const response = await fetchResource(path, options);
            return await response.json();
        } catch (error) {
            logger.error(`Failed to load JSON resource: ${path}`, error);
            throw error;
        }
    },

    /**
     * Loads a text resource.
     * @param {string} path
     * @param {!Object=} options
     * @return {!Promise<string>}
     */
    async getText(path, options = {}) {
        try {
            const response = await fetchResource(path, options);
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
