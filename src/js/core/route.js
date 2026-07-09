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
 * @fileoverview Config-driven router for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { logger } from '../util/logger.js';

const ROUTER_CONFIG = SEECHEN_WEBPAGE_CONFIG.ROUTER;
const OPTIONAL_TRAILING_SLASH = '/?$';
let routeHandler = null;

/**
 * Decodes a URL path safely.
 * @param {string} path
 * @return {string}
 */
function decodePath(path) {
    try {
        return decodeURIComponent(path);
    } catch (error) {
        logger.warn(`Failed to decode path: ${path}`, error);
        return path;
    }
}

/**
 * Removes query strings and hash fragments from a path.
 * @param {string} path
 * @return {string}
 */
function cleanPath(path) {
    const clean = String(path || '/').split(/[?#]/)[0] || '/';
    return clean.startsWith('/') ? clean : `/${clean}`;
}

/**
 * Normalizes a path segment for alias lookup.
 * @param {string} segment
 * @return {string}
 */
function normalizeAliasKey(segment) {
    return decodePath(segment).trim().toUpperCase();
}

/**
 * Gets a route by its configured name.
 * @param {string} routeName
 * @return {?Object}
 */
function getRouteByName(routeName) {
    return ROUTER_CONFIG.ROUTES.find((route) => route.NAME === routeName) || null;
}

/**
 * Resolves a path alias with direct and case-insensitive matching.
 * @param {!Object} aliases
 * @param {string} path
 * @return {string}
 */
function resolvePathAlias(aliases, path) {
    if (aliases[path]) {
        return aliases[path];
    }

    const normalizedPath = normalizeAliasKey(path);
    const aliasEntry = Object.entries(aliases).find(([alias]) => {
        return normalizeAliasKey(alias) === normalizedPath;
    });

    return aliasEntry ? aliasEntry[1] : '';
}

/**
 * Applies full-path and segment-level path aliases.
 * @param {string} path
 * @return {string}
 */
function applyPathAliases(path) {
    const aliases = ROUTER_CONFIG.PATH_ALIASES || {};
    const decodedPath = decodePath(path);
    const fullPathAlias = resolvePathAlias(aliases, decodedPath);

    if (fullPathAlias) {
        return fullPathAlias;
    }

    const segments = decodedPath.split('/').filter(Boolean);
    if (segments.length === 0) {
        return '/';
    }

    const firstSegment = `/${segments[0]}`;
    const firstAlias = resolvePathAlias(aliases, firstSegment);
    if (!firstAlias) {
        return decodedPath;
    }

    return [firstAlias, ...segments.slice(1)].join('/').replace(/\/+/g, '/');
}

/**
 * Converts a configured route path to a regular expression.
 * @param {string} routePath
 * @return {!RegExp}
 */
function pathToRegex(routePath) {
    if (routePath === '*') {
        return /^.*$/;
    }

    const pattern = routePath
        .replace(/\/+$/, '')
        .replace(/:[a-zA-Z][a-zA-Z0-9_]*/g, '([^/]+)');

    return new RegExp(`^${pattern || '/'}${OPTIONAL_TRAILING_SLASH}`);
}

/**
 * Extracts dynamic parameter names from a route path.
 * @param {string} routePath
 * @return {!Array<string>}
 */
function getParamNames(routePath) {
    return [...routePath.matchAll(/:([a-zA-Z][a-zA-Z0-9_]*)/g)].map((match) => match[1]);
}

/**
 * Applies configured aliases to a dynamic parameter value.
 * @param {string} value
 * @param {string=} aliasGroup
 * @return {string}
 */
function applyParamAlias(value, aliasGroup = '') {
    if (!aliasGroup) {
        return decodePath(value);
    }

    const aliases = ROUTER_CONFIG.PARAM_ALIASES?.[aliasGroup] || {};
    const decodedValue = decodePath(value);
    return aliases[decodedValue] || aliases[normalizeAliasKey(decodedValue)] || decodedValue;
}

/**
 * Extracts normalized params from a route match.
 * @param {!Object} route
 * @param {!Array<string>} match
 * @return {!Object}
 */
function extractParams(route, match) {
    const params = {};
    const paramNames = getParamNames(route.PATH);

    paramNames.forEach((paramName, index) => {
        const aliasGroup = route.PARAMS?.[paramName] || '';
        params[paramName] = applyParamAlias(match[index + 1], aliasGroup);
    });

    return params;
}

/**
 * Builds a standard route result.
 * @param {!Object} route
 * @param {!Object} params
 * @param {string} originalPath
 * @param {string} normalizedPath
 * @param {boolean} isFallback
 * @return {!Object}
 */
function createRouteResult(route, params, originalPath, normalizedPath, isFallback) {
    return {
        name: route.NAME,
        page: route.PAGE,
        layout: route.LAYOUT,
        title: route.TITLE || null,
        params,
        originalPath,
        normalizedPath,
        isFallback,
    };
}

/**
 * Gets the configured 404 route result.
 * @param {string} originalPath
 * @param {string} normalizedPath
 * @return {!Object}
 */
function getNotFoundRoute(originalPath, normalizedPath) {
    const notFoundRoute = getRouteByName(ROUTER_CONFIG.NOT_FOUND_ROUTE);

    if (!notFoundRoute) {
        return createRouteResult(
            {
                NAME: 'NOT_FOUND',
                PAGE: 'NOT_FOUND',
                LAYOUT: 'NOT_FOUND',
            },
            {},
            originalPath,
            normalizedPath,
            true,
        );
    }

    return createRouteResult(notFoundRoute, {}, originalPath, normalizedPath, true);
}

export const router = {
    /**
     * Registers a route result handler.
     * @param {Function} handler
     */
    setRouteHandler(handler) {
        routeHandler = handler;
    },

    /**
     * Navigates to a path and updates browser history.
     * @param {string} path
     * @param {{replace: boolean, executed: boolean}=} options
     * @return {!Promise<!Object>}
     */
    async navigate(path, options = {}) {
        const replace = options.replace || false;
        const executed = options.executed !== false;
        const originalPath = cleanPath(path);
        const routeResult = router.matchRoute(originalPath);
        const targetPath = ROUTER_CONFIG.PRESERVE_ORIGINAL_URL ?
            originalPath :
            routeResult.normalizedPath;
        const historyMethod = replace ? 'replaceState' : 'pushState';

        window.history[historyMethod]({}, '', targetPath);

        if (executed && routeHandler) {
            await routeHandler(routeResult);
        }

        return routeResult;
    },

    /**
     * Routes a path without forcing it to its normalized URL.
     * @param {string} path
     * @param {boolean=} executed
     * @return {!Promise<!Object>}
     */
    async route(path, executed = true) {
        const routeResult = router.matchRoute(path);
        logger.debug(`Route matched: ${routeResult.name} | ${routeResult.originalPath}`);

        if (executed && routeHandler) {
            await routeHandler(routeResult);
        }

        return routeResult;
    },

    /**
     * Matches a path against configured routes.
     * @param {string} path
     * @return {!Object}
     */
    matchRoute(path) {
        const originalPath = cleanPath(path);
        const normalizedPath = applyPathAliases(originalPath);
        const routes = ROUTER_CONFIG.ROUTES.filter((route) => route.PATH !== '*');

        for (const route of routes) {
            const match = normalizedPath.match(pathToRegex(route.PATH));

            if (match) {
                return createRouteResult(
                    route,
                    extractParams(route, match),
                    originalPath,
                    normalizedPath,
                    false,
                );
            }
        }

        return getNotFoundRoute(originalPath, normalizedPath);
    },
};

window.addEventListener('popstate', () => {
    router.route(window.location.pathname);
});
