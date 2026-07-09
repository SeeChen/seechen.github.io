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
import { isNonEmptyString } from '../util/type.js';
import { SEECHEN_LAYOUT } from '../repositories/layout-repository.js';
import { SEECHEN_RESOURCE } from '../services/resource.js';
import { SEECHEN_I18N } from '../services/i18n-service.js';
import { vDom } from './vDom.js';
import { SEECHEN_REGION_MANAGER } from './region-manager.js';

let activePage = null;

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
 * Resolves the region name for a route and page config.
 * @param {!Object} routeResult
 * @param {!Object} pageConfig
 * @return {string}
 */
function resolveRegionName(routeResult, pageConfig) {
    return routeResult.region ||
        pageConfig.REGION ||
        SEECHEN_WEBPAGE_CONFIG.PAGES.DEFAULT_REGION;
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
 * @param {string} regionName
 * @return {!Object}
 */
function createLifecycleContext(routeResult, eventScope, regionName) {
    const abortController = new AbortController();

    return {
        routeResult,
        eventScope,
        regionName,
        abortController,
        signal: abortController.signal,
        updateRegion(nextVDom) {
            const updatedVDom = SEECHEN_REGION_MANAGER.update(regionName, nextVDom);

            if (SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_REGION === regionName) {
                SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_VDOM = updatedVDom;
            }

            return updatedVDom;
        },
    };
}

/**
 * Creates an active page state object.
 * @param {!Object} options
 * @return {!Object}
 */
function createActivePage(options) {
    return {
        module: options.module || null,
        config: options.config || null,
        region: options.region || '',
        state: options.state || null,
        lifecycleContext: options.lifecycleContext || null,
    };
}

/**
 * Resets the public page context snapshot.
 */
function resetPageContext() {
    SEECHEN_WEBPAGE_CONTEXT.PAGE.STATE = null;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.ABORT_CONTROLLER = null;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.EVENT_SCOPE = '';
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_REGION = '';
}

/**
 * Updates the public page context snapshot.
 * @param {!Object} routeResult
 * @param {string} regionName
 * @param {import('./vDom.js').VNode|string} pageVDom
 * @param {*} pageState
 * @param {!Object} lifecycleContext
 * @param {string} eventScope
 */
function updatePageContext(
    routeResult,
    regionName,
    pageVDom,
    pageState,
    lifecycleContext,
    eventScope,
) {
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT = routeResult.page;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_ROUTE = routeResult;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_VDOM = pageVDom;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_REGION = regionName;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.STATE = pageState;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.ABORT_CONTROLLER =
        lifecycleContext.abortController;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.EVENT_SCOPE = eventScope;
}

/**
 * Stops the current page before navigating to another page.
 * @return {!Promise<void>}
 */
async function destroyCurrentPage() {
    const page = activePage;

    if (!page) {
        return;
    }

    if (page.lifecycleContext?.abortController) {
        page.lifecycleContext.abortController.abort();
    }

    try {
        if (page.module?.unmount) {
            await page.module.unmount(page.state, page.lifecycleContext);
        }
    } finally {
        if (page.config?.EVENT_SCOPE) {
            EventAgent.clearScope(page.config.EVENT_SCOPE, 'PageManager');
        }

        activePage = null;

        if (page.region) {
            SEECHEN_REGION_MANAGER.clear(page.region);
        }

        resetPageContext();
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
        const regionName = resolveRegionName(routeResult, pageConfig);
        const eventScope = pageConfig.EVENT_SCOPE || `PAGE:${routeResult.page}`;
        const lifecycleContext = createLifecycleContext(
            routeResult,
            eventScope,
            regionName,
        );

        await destroyCurrentPage();
        activePage = createActivePage({
            config: pageConfig,
            region: regionName,
            lifecycleContext,
        });

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

            activePage.module = pageModule;

            if (pageModule?.load) {
                pageState = await pageModule.load(routeResult, lifecycleContext);
            }

            activePage.state = pageState;

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
            SEECHEN_REGION_MANAGER.render(regionName, pageVDom);

            if (pageModule?.mount) {
                await pageModule.mount(routeResult, pageState, lifecycleContext);
            }

            activePage = createActivePage({
                module: pageModule,
                config: pageConfig,
                region: regionName,
                state: pageState,
                lifecycleContext,
            });

            updatePageContext(
                routeResult,
                regionName,
                pageVDom,
                pageState,
                lifecycleContext,
                eventScope,
            );
            updateDocumentTitle(routeResult);
            logger.info(`Page rendered: ${routeResult.page}`);
        } catch (error) {
            lifecycleContext.abortController.abort();

            if (activePage?.lifecycleContext === lifecycleContext) {
                activePage = null;
                resetPageContext();
            }

            throw error;
        }
    },

    /**
     * Destroys the current page lifecycle.
     * @return {!Promise<void>}
     */
    destroy() {
        return destroyCurrentPage();
    },
};
