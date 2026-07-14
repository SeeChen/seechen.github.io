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
import { cloneSeeChenObject, isNonEmptyString } from '../util/type.js';
import { SEECHEN_LAYOUT } from '../repositories/layout-repository.js';
import { SEECHEN_RESOURCE } from '../services/resource.js';
import { SEECHEN_I18N } from '../services/i18n-service.js';
import { vDom } from './vDom.js';
import { SEECHEN_REGION_MANAGER } from './region-manager.js';

const PAGE_STATUS = Object.freeze({
    ERROR: 'ERROR',
    LOADING: 'LOADING',
    READY: 'READY',
});

let activePage = null;
let pendingPage = null;
let retainedRegion = '';
let navigationSequence = 0;

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
 * Creates the lifecycle context passed into page modules.
 * @param {!Object} routeResult
 * @param {string} eventScope
 * @param {string} regionName
 * @param {number} navigationId
 * @return {!Object}
 */
function createLifecycleContext(
    routeResult,
    eventScope,
    regionName,
    navigationId,
) {
    const abortController = new AbortController();
    const lifecycleContext = {
        routeResult,
        eventScope,
        regionName,
        navigationId,
        abortController,
        signal: abortController.signal,
        isActive() {
            return activePage?.lifecycleContext === lifecycleContext &&
                !lifecycleContext.signal.aborted;
        },
        updateRegion(nextVDom) {
            if (!lifecycleContext.isActive()) {
                logger.debug('Ignored an update from an inactive page.');
                return null;
            }

            const updatedVDom = SEECHEN_REGION_MANAGER.update(regionName, nextVDom);

            SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_VDOM = updatedVDom;

            return updatedVDom;
        },
    };

    return lifecycleContext;
}

/**
 * Creates a page lifecycle record.
 * @param {!Object} options
 * @return {!Object}
 */
function createPageRecord(options) {
    return {
        module: options.module || null,
        config: options.config || null,
        layout: options.layout || null,
        region: options.region || '',
        routeResult: options.routeResult || null,
        state: options.state || null,
        lifecycleContext: options.lifecycleContext || null,
    };
}

/**
 * Resets the public page context snapshot.
 */
function resetPageContext() {
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT = null;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_ROUTE = null;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_VDOM = null;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.CURRENT_REGION = '';
    SEECHEN_WEBPAGE_CONTEXT.PAGE.STATE = null;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.ABORT_CONTROLLER = null;
    SEECHEN_WEBPAGE_CONTEXT.PAGE.EVENT_SCOPE = '';
}

/**
 * Updates a page region's observable loading state.
 * @param {string} regionName
 * @param {string} status
 */
function setPageStatus(regionName, status) {
    const root = SEECHEN_REGION_MANAGER.getRoot(regionName);
    const normalizedStatus = status.toLowerCase();

    root.dataset.seechenPageStatus = normalizedStatus;
    root.setAttribute(
        'aria-busy',
        String(status === PAGE_STATUS.LOADING),
    );
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
 * @param {boolean=} clearRegion
 * @return {!Promise<void>}
 */
async function destroyCurrentPage(clearRegion = true) {
    const page = activePage;

    if (!page) {
        return;
    }

    activePage = null;

    if (page.lifecycleContext?.abortController) {
        page.lifecycleContext.abortController.abort();
    }

    try {
        if (page.module?.unmount) {
            await page.module.unmount(page.state, page.lifecycleContext);
        }
    } finally {
        if (page.lifecycleContext?.eventScope) {
            EventAgent.clearScope(
                page.lifecycleContext.eventScope,
                'PageManager',
            );
        }

        if (page.region) {
            setPageStatus(page.region, PAGE_STATUS.READY);

            if (clearRegion) {
                SEECHEN_REGION_MANAGER.clear(page.region);
            } else {
                retainedRegion = page.region;
            }
        }

        resetPageContext();
    }
}

/**
 * Cancels a page that has not reached the render phase yet.
 */
function cancelPendingPage() {
    pendingPage?.lifecycleContext.abortController.abort();
    pendingPage = null;
}

/**
 * Checks whether a prepared page still owns the latest navigation.
 * @param {!Object} page
 * @return {boolean}
 */
function isCurrentNavigation(page) {
    return page.lifecycleContext.navigationId === navigationSequence &&
        !page.lifecycleContext.signal.aborted;
}

/**
 * Loads the resources required to render a page shell.
 * @param {!Object} page
 * @return {!Promise<!Object>}
 */
async function preparePage(page) {
    const routeResult = page.routeResult;
    const pageConfig = page.config;
    const layoutName = resolveLayoutName(routeResult, pageConfig);
    const styleLoader = isNonEmptyString(pageConfig.STYLE) ?
        SEECHEN_RESOURCE.loadStyle(pageConfig.STYLE) :
        Promise.resolve();
    const [pageModule, layout] = await Promise.all([
        loadPageModule(pageConfig),
        SEECHEN_LAYOUT.getPageLayout(layoutName),
        loadNamespaces(pageConfig.I18N || []),
        styleLoader,
    ]);

    page.module = pageModule;
    page.layout = cloneSeeChenObject(layout);
    return page;
}

/**
 * Removes a previous page region after the next shell is ready to render.
 * @param {string} nextRegion
 */
function releaseRetainedRegion(nextRegion) {
    if (retainedRegion && retainedRegion !== nextRegion) {
        SEECHEN_REGION_MANAGER.clear(retainedRegion);
    }

    retainedRegion = '';
}

/**
 * Moves every committed page navigation to the top immediately.
 */
function scrollPageToTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
    });
}

/**
 * Stores page state in both the owner and public context.
 * @param {!Object} page
 * @param {*} pageState
 */
function updatePageState(page, pageState) {
    page.state = pageState;

    if (activePage === page) {
        SEECHEN_WEBPAGE_CONTEXT.PAGE.STATE = pageState;
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
        const navigationId = ++navigationSequence;
        const pageConfig = getPageConfig(routeResult.page);
        const regionName = resolveRegionName(routeResult, pageConfig);
        const eventScope = pageConfig.EVENT_SCOPE || `PAGE:${routeResult.page}`;
        const lifecycleContext = createLifecycleContext(
            routeResult,
            eventScope,
            regionName,
            navigationId,
        );
        const page = createPageRecord({
            config: pageConfig,
            region: regionName,
            routeResult,
            lifecycleContext,
        });

        cancelPendingPage();
        pendingPage = page;

        try {
            await preparePage(page);

            if (!isCurrentNavigation(page)) {
                return;
            }

            await destroyCurrentPage(false);

            if (!isCurrentNavigation(page)) {
                return;
            }

            scrollPageToTop();
            const pageVDom = vDom.create(page.layout);
            SEECHEN_REGION_MANAGER.render(regionName, pageVDom);
            releaseRetainedRegion(regionName);
            activePage = page;
            pendingPage = null;

            updatePageContext(
                routeResult,
                regionName,
                pageVDom,
                null,
                lifecycleContext,
                eventScope,
            );
            updateDocumentTitle(routeResult);
            setPageStatus(regionName, PAGE_STATUS.LOADING);

            // The page shell stays visible while load() resolves data.
            let pageState = null;

            if (page.module?.load) {
                pageState = await page.module.load(
                    routeResult,
                    lifecycleContext,
                );
            }

            if (!lifecycleContext.isActive()) {
                return;
            }

            updatePageState(page, pageState);

            if (page.module?.transformLayout) {
                const transformedLayout = await page.module.transformLayout(
                    cloneSeeChenObject(page.layout),
                    routeResult,
                    pageState,
                    lifecycleContext,
                );

                if (!lifecycleContext.isActive()) {
                    return;
                }

                lifecycleContext.updateRegion(vDom.create(transformedLayout));
            }

            if (page.module?.mount) {
                await page.module.mount(
                    routeResult,
                    pageState,
                    lifecycleContext,
                );
            }

            if (!lifecycleContext.isActive()) {
                return;
            }

            setPageStatus(regionName, PAGE_STATUS.READY);
            logger.info(`Page rendered: ${routeResult.page}`);
        } catch (error) {
            const wasCancelled = lifecycleContext.signal.aborted ||
                navigationId !== navigationSequence;

            lifecycleContext.abortController.abort();

            if (pendingPage === page) {
                pendingPage = null;
            }

            if (activePage === page) {
                setPageStatus(regionName, PAGE_STATUS.ERROR);
            }

            if (wasCancelled) {
                logger.debug(`Page navigation cancelled: ${routeResult.page}`);
                return;
            }

            throw error;
        }
    },

    /**
     * Destroys the current page lifecycle.
     * @return {!Promise<void>}
     */
    async destroy() {
        navigationSequence++;
        cancelPendingPage();
        await destroyCurrentPage();

        if (retainedRegion) {
            SEECHEN_REGION_MANAGER.clear(retainedRegion);
            retainedRegion = '';
        }
    },
};
