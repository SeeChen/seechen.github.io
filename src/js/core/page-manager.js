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
 * @fileoverview Page lifecycle manager for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { SEECHEN_WEBPAGE_CONTEXT } from './app-context.js';
import { EventAgent } from '../middleware/eventAgent.js';
import { logger } from '../util/logger.js';
import { SEECHEN_LAYOUT } from '../repositories/layout-repository.js';
import { SEECHEN_RESOURCE } from '../services/resource.js';
import { SEECHEN_I18N } from '../services/i18n-service.js';
import { vDom } from './vDom.js';

let currentPageModule = null;
let currentPageConfig = null;
let currentPageState = null;
let currentLifecycleContext = null;

/**
 * Checks whether a value is a non-empty string.
 * @param {*} value
 * @return {boolean}
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

/**
 * Gets the current page root element.
 * @return {!Element}
 */
function getRootElement() {
    const selector = SEECHEN_WEBPAGE_CONFIG.PAGES.ROOT_SELECTOR;
    const root = document.querySelector(selector);

    if (!root) {
        throw new Error(`Page root element not found: ${selector}`);
    }

    return root;
}

/**
 * Gets page config by page name.
 * @param {string} pageName
 * @return {!Object}
 */
function getPageConfig(pageName) {
    const normalizedPageName = pageName.trim().toUpperCase();
    const pageConfig = SEECHEN_WEBPAGE_CONFIG.PAGES[normalizedPageName];

    if (!pageConfig) {
        throw new Error(`Unknown page config: ${normalizedPageName}`);
    }

    return pageConfig;
}

/**
 * Loads configured i18n namespaces.
 * @param {!Array<string>=} namespaces
 * @return {!Promise<void>}
 */
async function loadNamespaces(namespaces = []) {
    await Promise.all(namespaces.map((namespace) => {
        return SEECHEN_I18N.loadNamespace(namespace);
    }));
}

/**
 * Loads a page module when configured.
 * @param {!Object} pageConfig
 * @return {!Promise<?Object>}
 */
async function loadPageModule(pageConfig) {
    if (!isNonEmptyString(pageConfig.SCRIPT)) {
        return null;
    }

    const module = await SEECHEN_RESOURCE.loadModule(pageConfig.SCRIPT);
    return module.default || module;
}

/**
 * Resolves the layout name for a route and page config.
 * @param {!Object} routeResult
 * @param {!Object} pageConfig
 * @return {string}
 */
function resolveLayoutName(routeResult, pageConfig) {
    return routeResult.layout || pageConfig.LAYOUT || routeResult.page;
}

/**
 * Clones a layout before page modules transform it.
 * @param {!Object} layout
 * @return {!Object}
 */
function cloneLayout(layout) {
    if (typeof structuredClone === 'function') {
        return structuredClone(layout);
    }

    return JSON.parse(JSON.stringify(layout));
}

/**
 * Creates the lifecycle context passed into page modules.
 * @param {!Object} routeResult
 * @param {string} eventScope
 * @return {!Object}
 */
function createLifecycleContext(routeResult, eventScope) {
    const abortController = new AbortController();

    return {
        routeResult,
        eventScope,
        abortController,
        signal: abortController.signal,
    };
}

/**
 * Stops the current page before navigating to another page.
 * @return {!Promise<void>}
 */
async function destroyCurrentPage() {
    const pageModule = currentPageModule;
    const pageConfig = currentPageConfig;
    const pageState = currentPageState;
    const lifecycleContext = currentLifecycleContext;

    if (lifecycleContext?.abortController) {
        lifecycleContext.abortController.abort();
    }

    try {
        if (pageModule?.unmount) {
            await pageModule.unmount(pageState, lifecycleContext);
        }
    } finally {
        if (pageConfig?.EVENT_SCOPE) {
            EventAgent.clearScope(pageConfig.EVENT_SCOPE, 'PageManager');
        }

        currentPageModule = null;
        currentPageConfig = null;
        currentPageState = null;
        currentLifecycleContext = null;

        SEECHEN_WEBPAGE_CONTEXT.PAGE.STATE = null;
        SEECHEN_WEBPAGE_CONTEXT.PAGE.ABORT_CONTROLLER = null;
        SEECHEN_WEBPAGE_CONTEXT.PAGE.EVENT_SCOPE = '';
    }
}

/**
 * Updates the document title when route title config is available.
 * @param {!Object} routeResult
 */
function updateDocumentTitle(routeResult) {
    if (!routeResult.title) {
        return;
    }

    const namespace = routeResult.title.NAMESPACE;
    const key = routeResult.title.KEY;

    if (!isNonEmptyString(namespace) || !isNonEmptyString(key)) {
        return;
    }

    document.title = `${SEECHEN_I18N.t(namespace, key)} | SEECHEN`;
}

export const SEECHEN_PAGE_MANAGER = {
    /**
     * Navigates to a route result and runs the page lifecycle.
     * @param {!Object} routeResult
     * @return {!Promise<void>}
     */
    async navigate(routeResult) {
        const pageConfig = getPageConfig(routeResult.page);
        const eventScope = pageConfig.EVENT_SCOPE || `PAGE:${routeResult.page}`;
        const lifecycleContext = createLifecycleContext(routeResult, eventScope);

        await destroyCurrentPage();
        currentPageConfig = pageConfig;
        currentLifecycleContext = lifecycleContext;

        try {
            await loadNamespaces(pageConfig.I18N || []);

            if (lifecycleContext.signal.aborted) {
                return;
            }

            if (isNonEmptyString(pageConfig.STYLE)) {
                await SEECHEN_RESOURCE.loadStyle(pageConfig.STYLE);
            }

            if (lifecycleContext.signal.aborted) {
                return;
            }

            const pageModule = await loadPageModule(pageConfig);
            let pageState = null;

            if (pageModule?.load) {
                pageState = await pageModule.load(routeResult, lifecycleContext);
            }

            if (lifecycleContext.signal.aborted) {
                return;
            }

            const layoutName = resolveLayoutName(routeResult, pageConfig);
            let layout = cloneLayout(await SEECHEN_LAYOUT.getPageLayout(layoutName));

            if (pageModule?.transformLayout) {
                layout = await pageModule.transformLayout(
                    layout,
                    routeResult,
                    pageState,
                    lifecycleContext,
                );
            }

            if (lifecycleContext.signal.aborted) {
                return;
            }

            const pageVDom = vDom.create(layout);
            const pageElement = vDom.render(pageVDom);
            const root = getRootElement();

            root.replaceChildren(pageElement);

            if (pageModule?.mount) {
                await pageModule.mount(routeResult, pageState, lifecycleContext);
            }

            SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT = routeResult.page;
            SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_ROUTE = routeResult;
            SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_VDOM = pageVDom;
            SEECHEN_WEBPAGE_CONTEXT.PAGE.STATE = pageState;
            SEECHEN_WEBPAGE_CONTEXT.PAGE.ABORT_CONTROLLER =
                lifecycleContext.abortController;
            SEECHEN_WEBPAGE_CONTEXT.PAGE.EVENT_SCOPE = eventScope;

            currentPageModule = pageModule;
            currentPageConfig = pageConfig;
            currentPageState = pageState;
            currentLifecycleContext = lifecycleContext;

            updateDocumentTitle(routeResult);
            logger.info(`Page rendered: ${routeResult.page}`);
        } catch (error) {
            lifecycleContext.abortController.abort();

            if (currentLifecycleContext === lifecycleContext) {
                currentPageModule = null;
                currentPageConfig = null;
                currentPageState = null;
                currentLifecycleContext = null;
                SEECHEN_WEBPAGE_CONTEXT.PAGE.STATE = null;
                SEECHEN_WEBPAGE_CONTEXT.PAGE.ABORT_CONTROLLER = null;
                SEECHEN_WEBPAGE_CONTEXT.PAGE.EVENT_SCOPE = '';
            }

            throw error;
        }
    },

    /**
     * Renders a route result into the configured page root.
     * @param {!Object} routeResult
     * @return {!Promise<void>}
     */
    render(routeResult) {
        return this.navigate(routeResult);
    },

    /**
     * Destroys the current page lifecycle.
     * @return {!Promise<void>}
     */
    destroy() {
        return destroyCurrentPage();
    },
};
