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
 * @fileoverview Persistent Navigation component for SeeChen Website.
 */

import { SEECHEN_COMPONENTS } from '../core/component-registry.js';
import { SEECHEN_REGION_MANAGER } from '../core/region-manager.js';
import { router } from '../core/route.js';
import { vDom } from '../core/vDom.js';
import { SEECHEN_SITE_MANIFEST } from '../repositories/site-manifest-repository.js';
import { SEECHEN_I18N } from '../services/i18n-service.js';
import {
    SEECHEN_RESPONSIVE,
    SEECHEN_VIEWPORT,
} from '../services/responsive.js';
import {
    SEECHEN_SCROLL_POSITION,
    SEECHEN_SCROLL_THRESHOLD,
} from '../services/scroll-threshold.js';
import {
    findSeeChenLayoutSlot,
    setSeeChenLayoutSlotChildren,
} from '../util/layout.js';
import { logger } from '../util/logger.js';
import { cloneSeeChenObject } from '../util/type.js';

const COMPONENT_NAME = 'NAVIGATION';
const REGION_NAME = 'NAVIGATION';
const MENU_TOGGLE_ACTION = 'toggle-menu';
const EDITORIAL_VARIANT = 'EDITORIAL';
const DEFAULT_VARIANT = 'DEFAULT';
const EXPANDED_MODE = 'EXPANDED';
const COMPACT_MODE = 'COMPACT';

let clickCleanup = null;
let documentClickCleanup = null;
let keydownCleanup = null;
let responsiveCleanup = null;
let scrollCleanup = null;
let navigationState = null;

/**
 * Creates the shared class and interaction props for a menu route.
 * @param {!Object} route
 * @param {string} className
 * @param {boolean} isCurrent
 * @return {!Object}
 */
function createMenuProps(route, className, isCurrent) {
    const isEnabled = route.ENABLED !== false;
    const classNames = [className];

    if (!isEnabled) {
        classNames.push(`${className}--disabled`);
    }

    if (isCurrent) {
        classNames.push(`${className}--current`);
    }

    const props = {
        class: classNames.join(' '),
        'data-seechen-menu-route': route.NAME,
    };

    if (isEnabled) {
        props.href = route.PATH;
        props['data-seechen-route'] = route.PATH;
    } else {
        props['aria-disabled'] = 'true';
    }

    if (isCurrent) {
        props['aria-current'] = 'page';
    }

    return props;
}

/**
 * Creates one desktop navigation item.
 * @param {!Object} route
 * @param {number} index
 * @return {!Object}
 */
function createDesktopMenuLayout(route, index) {
    const isEnabled = route.ENABLED !== false;
    const isCurrent = isEnabled && route.NAME === navigationState.activeMenu;
    const className = 'seechen-navigation__desktop-item';

    return {
        tag: isEnabled ? 'a' : 'div',
        props: createMenuProps(route, className, isCurrent),
        children: [
            {
                tag: 'span',
                props: {
                    class: 'seechen-navigation__desktop-number',
                    'aria-hidden': 'true',
                },
                children: [String(index + 1).padStart(2, '0')],
            },
            {
                tag: 'span',
                props: {
                    class: 'seechen-navigation__desktop-label',
                },
                lang: 'SHELL',
                children: [route.MENU.LABEL_KEY],
            },
        ],
    };
}

/**
 * Creates one mobile navigation item.
 * @param {!Object} route
 * @param {number} index
 * @return {!Object}
 */
function createMobileMenuLayout(route, index) {
    const isEnabled = route.ENABLED !== false;
    const isCurrent = isEnabled && route.NAME === navigationState.activeMenu;
    const className = 'seechen-navigation__mobile-item';
    const children = [
        {
            tag: 'span',
            props: {
                class: 'seechen-navigation__mobile-number',
                'aria-hidden': 'true',
            },
            children: [String(index + 1).padStart(2, '0')],
        },
        {
            tag: 'span',
            props: {
                class: 'seechen-navigation__mobile-label',
            },
            lang: 'SHELL',
            children: [route.MENU.LABEL_KEY],
        },
    ];

    if (!isEnabled) {
        children.push({
            tag: 'span',
            props: {
                class: 'seechen-navigation__mobile-status',
            },
            lang: 'SHELL',
            children: ['MENU_COMING_SOON'],
        });
    }

    return {
        tag: isEnabled ? 'a' : 'div',
        props: createMenuProps(route, className, isCurrent),
        children,
    };
}

/**
 * Creates the compact current-page indicator for mobile navigation.
 * @return {!Array<!Object>}
 */
function createCurrentMenuLayout() {
    const routeIndex = navigationState.menuRoutes.findIndex((route) => {
        return route.NAME === navigationState.activeMenu;
    });
    const menuRoute = navigationState.menuRoutes[routeIndex];
    const title = navigationState.routeResult.title || {};
    const namespace = menuRoute ? 'SHELL' : title.NAMESPACE || 'SHELL';
    const labelKey = menuRoute?.MENU.LABEL_KEY || title.KEY || 'NOT_FOUND';
    const number = routeIndex >= 0 ?
        String(routeIndex + 1).padStart(2, '0') :
        '--';

    return [
        {
            tag: 'span',
            props: {
                class: 'seechen-navigation__current-number',
                'aria-hidden': 'true',
            },
            children: [number],
        },
        {
            tag: 'span',
            props: {
                'aria-hidden': 'true',
            },
            children: ['/'],
        },
        {
            tag: 'span',
            props: {
                class: 'seechen-navigation__current-label',
            },
            lang: namespace,
            children: [labelKey],
        },
    ];
}

/**
 * Maps scroll-threshold position to Navigation presentation mode.
 * @param {string} position
 * @return {string}
 */
function getModeForScrollPosition(position) {
    return position === SEECHEN_SCROLL_POSITION.BEFORE ?
        EXPANDED_MODE :
        COMPACT_MODE;
}

/**
 * Handles a discrete HOME scroll-threshold state change.
 * @param {string} position
 */
function handleScrollPositionChange(position) {
    if (!navigationState || navigationState.variant !== EDITORIAL_VARIANT) {
        return;
    }

    const nextMode = getModeForScrollPosition(position);

    if (nextMode === navigationState.mode) {
        return;
    }

    navigationState.mode = nextMode;
    updateNavigationRegion();
}

/**
 * Configures route-driven Navigation presentation and scroll subscription.
 * @param {!Object} routeResult
 */
function configureRoutePresentation(routeResult) {
    scrollCleanup?.();
    scrollCleanup = null;

    const config = routeResult.navigation;
    const isEditorial = config?.VARIANT === EDITORIAL_VARIANT;

    navigationState.variant = isEditorial ?
        EDITORIAL_VARIANT :
        DEFAULT_VARIANT;
    navigationState.mode = COMPACT_MODE;

    if (!isEditorial) {
        return;
    }

    const options = {
        collapseAt: config.COLLAPSE_AT,
        expandAt: config.EXPAND_AT,
    };
    const position = SEECHEN_SCROLL_THRESHOLD.getPosition(options);

    navigationState.mode = getModeForScrollPosition(position);
    scrollCleanup = SEECHEN_SCROLL_THRESHOLD.subscribe(
        options,
        handleScrollPositionChange,
    );
}

/**
 * Builds a Navigation virtual DOM tree from JSON and runtime route data.
 * @return {import('../core/vDom.js').VNode|string}
 */
function createNavigationVDom() {
    const template = SEECHEN_COMPONENTS.get(COMPONENT_NAME);

    if (!template || !navigationState) {
        throw new Error('Navigation component state must be initialized.');
    }

    const layout = cloneSeeChenObject(template);
    const desktopMenu = findSeeChenLayoutSlot(layout, 'desktop-menu');
    const release = findSeeChenLayoutSlot(layout, 'release');
    const toggle = findSeeChenLayoutSlot(layout, 'toggle');
    const panel = findSeeChenLayoutSlot(layout, 'panel');

    if (!desktopMenu || !release || !toggle || !panel) {
        throw new Error('Required Navigation layout slot not found.');
    }

    const activeIndex = navigationState.menuRoutes.findIndex((route) => {
        return route.NAME === navigationState.activeMenu;
    });
    const menuCount = Math.max(1, navigationState.menuRoutes.length);
    const indicatorPosition = (
        (Math.max(0, activeIndex) + 0.5) * 100 / menuCount
    );
    const indicatorClassNames = ['seechen-navigation__desktop-indicator'];

    if (activeIndex < 0) {
        indicatorClassNames.push(
            'seechen-navigation__desktop-indicator--hidden',
        );
    }

    desktopMenu.props.style =
        `--seechen-navigation-indicator-position: ${indicatorPosition}%;`;

    setSeeChenLayoutSlotChildren(
        layout,
        'brand',
        [navigationState.manifest.SITE.NAME],
    );
    setSeeChenLayoutSlotChildren(
        layout,
        'release',
        [
            `VERSION ${navigationState.manifest.RELEASE.VERSION} / ` +
                String(navigationState.manifest.RELEASE.NAME).toUpperCase(),
        ],
    );
    setSeeChenLayoutSlotChildren(
        layout,
        'desktop-menu',
        [
            ...navigationState.menuRoutes.map(createDesktopMenuLayout),
            {
                tag: 'span',
                props: {
                    class: indicatorClassNames.join(' '),
                    'aria-hidden': 'true',
                },
                children: [],
            },
        ],
    );
    setSeeChenLayoutSlotChildren(
        layout,
        'mobile-menu',
        navigationState.menuRoutes.map(createMobileMenuLayout),
    );
    setSeeChenLayoutSlotChildren(layout, 'current', createCurrentMenuLayout());

    const toggleLabelKey = navigationState.isMenuOpen ?
        'NAVIGATION_CLOSE_MENU' :
        'NAVIGATION_OPEN_MENU';
    const toggleLabel = SEECHEN_I18N.t('SHELL', toggleLabelKey);

    layout.props['data-seechen-variant'] =
        navigationState.variant.toLowerCase();
    layout.props['data-seechen-mode'] = navigationState.mode.toLowerCase();
    release.props['aria-hidden'] = String(
        navigationState.mode !== EXPANDED_MODE,
    );
    toggle.props['aria-expanded'] = String(navigationState.isMenuOpen);
    toggle.props['aria-label'] = toggleLabel;
    toggle.props.title = toggleLabel;
    panel.props['aria-hidden'] = String(!navigationState.isMenuOpen);
    panel.props['data-seechen-open'] = String(navigationState.isMenuOpen);

    return vDom.create(layout);
}

/**
 * Updates the rendered Navigation from current component state.
 */
function updateNavigationRegion() {
    SEECHEN_REGION_MANAGER.update(REGION_NAME, createNavigationVDom());
}

/**
 * Closes the mobile menu when it is open.
 * @param {boolean=} restoreFocus
 */
function closeMenu(restoreFocus = false) {
    if (!navigationState?.isMenuOpen) {
        return;
    }

    navigationState.isMenuOpen = false;
    updateNavigationRegion();

    if (restoreFocus) {
        const root = SEECHEN_REGION_MANAGER.getRoot(REGION_NAME);
        root.querySelector('[data-seechen-action="toggle-menu"]')?.focus();
    }
}

/**
 * Handles Navigation clicks and delegates internal links to Router.
 * @param {!MouseEvent} event
 */
function handleClick(event) {
    if (!(event.target instanceof Element)) {
        return;
    }

    const action = event.target.closest('[data-seechen-action]');

    if (action?.dataset.seechenAction === MENU_TOGGLE_ACTION) {
        event.preventDefault();
        navigationState.isMenuOpen = !navigationState.isMenuOpen;
        updateNavigationRegion();
        return;
    }

    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return;
    }

    const routeLink = event.target.closest('[data-seechen-route]');

    if (!routeLink) {
        return;
    }

    event.preventDefault();
    closeMenu();
    router.navigate(routeLink.dataset.seechenRoute).catch((error) => {
        logger.error('Navigation failed.', error);
    });
}

/**
 * Closes the mobile menu after clicking outside Navigation.
 * @param {!MouseEvent} event
 */
function handleDocumentClick(event) {
    if (!navigationState?.isMenuOpen || !(event.target instanceof Node)) {
        return;
    }

    const root = SEECHEN_REGION_MANAGER.getRoot(REGION_NAME);

    if (!root.contains(event.target)) {
        closeMenu();
    }
}

/**
 * Supports Escape dismissal for the mobile menu.
 * @param {!KeyboardEvent} event
 */
function handleKeydown(event) {
    if (event.key === 'Escape') {
        closeMenu(true);
    }
}

/**
 * Resets mobile menu state when entering desktop navigation.
 * @param {string} viewport
 */
function handleViewportChange(viewport) {
    if (viewport === SEECHEN_VIEWPORT.DESKTOP) {
        closeMenu();
    }
}

/**
 * Registers Navigation DOM and responsive events.
 */
function registerEvents() {
    const root = SEECHEN_REGION_MANAGER.getRoot(REGION_NAME);
    root.addEventListener('click', handleClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    clickCleanup = () => {
        root.removeEventListener('click', handleClick);
        clickCleanup = null;
    };
    documentClickCleanup = () => {
        document.removeEventListener('click', handleDocumentClick);
        documentClickCleanup = null;
    };
    keydownCleanup = () => {
        document.removeEventListener('keydown', handleKeydown);
        keydownCleanup = null;
    };
    responsiveCleanup = SEECHEN_RESPONSIVE.subscribe(handleViewportChange);
}

/**
 * Removes all Navigation event subscriptions.
 */
function cleanupEvents() {
    clickCleanup?.();
    documentClickCleanup?.();
    keydownCleanup?.();
    responsiveCleanup?.();
    responsiveCleanup = null;
    scrollCleanup?.();
    scrollCleanup = null;
}

export const SEECHEN_NAVIGATION = {
    /**
     * Loads Navigation resources and renders its initial route state.
     * @param {!Object} initialRoute
     * @return {!Promise<void>}
     */
    async render(initialRoute) {
        await Promise.all([
            SEECHEN_COMPONENTS.register(COMPONENT_NAME),
            SEECHEN_I18N.loadNamespace('SHELL'),
        ]);

        const [manifest, menuRoutes] = await Promise.all([
            SEECHEN_SITE_MANIFEST.get(),
            SEECHEN_SITE_MANIFEST.getMenuRoutes(),
        ]);

        cleanupEvents();
        navigationState = {
            manifest,
            menuRoutes,
            routeResult: initialRoute,
            activeMenu: initialRoute.activeMenu,
            isMenuOpen: false,
            variant: DEFAULT_VARIANT,
            mode: COMPACT_MODE,
        };

        configureRoutePresentation(initialRoute);
        SEECHEN_REGION_MANAGER.render(REGION_NAME, createNavigationVDom());
        registerEvents();
        logger.info('Navigation rendered.');
    },

    /**
     * Updates route-dependent Navigation state through vDOM diffing.
     * @param {!Object} routeResult
     */
    update(routeResult) {
        if (!navigationState) {
            return;
        }

        navigationState.routeResult = routeResult;
        navigationState.activeMenu = routeResult.activeMenu;
        navigationState.isMenuOpen = false;
        configureRoutePresentation(routeResult);
        updateNavigationRegion();
    },

    /**
     * Destroys Navigation events, region content, and runtime state.
     */
    destroy() {
        cleanupEvents();
        SEECHEN_REGION_MANAGER.clear(REGION_NAME);
        navigationState = null;
    },
};
