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
 * @fileoverview Persistent Footer component for SeeChen Website.
 */

import { SEECHEN_COMPONENTS } from '../core/component-registry.js';
import { SEECHEN_REGION_MANAGER } from '../core/region-manager.js';
import { router } from '../core/route.js';
import { vDom } from '../core/vDom.js';
import { SEECHEN_SITE_MANIFEST } from '../repositories/site-manifest-repository.js';
import { SEECHEN_I18N } from '../services/i18n-service.js';
import { SEECHEN_RESPONSIVE } from '../services/responsive.js';
import { setSeeChenLayoutSlotChildren } from '../util/layout.js';
import { logger } from '../util/logger.js';
import { cloneSeeChenObject, isNonEmptyString } from '../util/type.js';

const COMPONENT_NAME = 'FOOTER';
const REGION_NAME = 'FOOTER';
const I18N_NAMESPACES = Object.freeze(['SHELL', 'FOOTER']);

let clickCleanup = null;
let responsiveCleanup = null;
let footerState = null;

/**
 * Creates the configured release layout.
 * @param {!Object} release
 * @return {!Array<!Object>}
 */
function createReleaseLayout(release) {
    return [
        {
            tag: 'p',
            props: {
                class: 'seechen-footer__release-meta',
            },
            children: [`VERSION ${release.VERSION} / ${release.YEAR}`],
        },
        {
            tag: 'p',
            props: {
                class: 'seechen-footer__release-name',
            },
            children: [String(release.NAME || '').toUpperCase()],
        },
        {
            tag: 'p',
            props: {
                class: 'seechen-footer__release-localized',
            },
            lang: 'FOOTER',
            children: [release.LOCALIZED_NAME_KEY],
        },
        {
            tag: 'p',
            props: {
                class: 'seechen-footer__release-description',
            },
            lang: 'FOOTER',
            children: [release.DESCRIPTION_KEY],
        },
    ];
}

/**
 * Creates a Footer menu item.
 * @param {!Object} route
 * @param {number} index
 * @param {string} activeMenu
 * @return {!Object}
 */
function createMenuLayout(route, index, activeMenu) {
    const isEnabled = route.ENABLED !== false;
    const isCurrent = isEnabled && route.NAME === activeMenu;
    const classNames = ['seechen-footer__menu-item'];

    if (!isEnabled) {
        classNames.push('seechen-footer__menu-item--disabled');
    }

    if (isCurrent) {
        classNames.push('seechen-footer__menu-item--current');
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

    return {
        tag: isEnabled ? 'a' : 'div',
        props,
        children: [
            {
                tag: 'span',
                props: {
                    class: 'seechen-footer__menu-number',
                    'aria-hidden': 'true',
                },
                children: [String(index + 1).padStart(2, '0')],
            },
            {
                tag: 'div',
                props: {
                    class: 'seechen-footer__menu-copy',
                },
                children: [
                    {
                        tag: 'p',
                        props: {
                            class: 'seechen-footer__menu-label',
                        },
                        lang: 'SHELL',
                        children: [route.MENU.LABEL_KEY],
                    },
                    {
                        tag: 'p',
                        props: {
                            class: 'seechen-footer__menu-description',
                        },
                        lang: 'FOOTER',
                        children: [route.MENU.DESCRIPTION_KEY],
                    },
                ],
            },
        ],
    };
}

/**
 * Creates a configured social link.
 * @param {!Object} item
 * @return {!Object}
 */
function createSocialLayout(item) {
    const isExternal = /^https?:/i.test(item.HREF);
    const hasIcon = isNonEmptyString(item.ICON);
    const props = {
        class: 'seechen-footer__social-link',
        href: item.HREF,
        title: item.LABEL,
        'aria-label': item.LABEL,
        'data-seechen-social': item.ID,
    };

    if (isExternal) {
        props.target = '_blank';
        props.rel = 'noreferrer';
    }

    const markProps = {
        class: 'seechen-footer__social-mark',
        'aria-hidden': 'true',
    };

    if (hasIcon) {
        markProps.class += ' seechen-footer__social-mark--icon';
        markProps.style =
            `--seechen-social-icon: url(${JSON.stringify(item.ICON)});`;
    }

    return {
        tag: 'a',
        props,
        children: [
            {
                tag: 'span',
                props: markProps,
                children: hasIcon ? [] : [item.SHORT_LABEL || item.LABEL],
            },
        ],
    };
}

/**
 * Gets visible social items for the current configured viewport.
 * @return {!Array<!Object>}
 */
function getVisibleSocialItems() {
    const viewport = SEECHEN_RESPONSIVE.getCurrentViewport();
    const maxVisible = footerState.manifest.SOCIAL.MAX_VISIBLE[viewport];
    return footerState.socialItems.slice(0, maxVisible);
}

/**
 * Builds a Footer virtual DOM tree from its JSON template and runtime data.
 * @param {string} activeMenu
 * @return {import('../core/vDom.js').VNode|string}
 */
function createFooterVDom(activeMenu) {
    const template = SEECHEN_COMPONENTS.get(COMPONENT_NAME);

    if (!template || !footerState) {
        throw new Error('Footer component state must be initialized.');
    }

    const layout = cloneSeeChenObject(template);
    setSeeChenLayoutSlotChildren(
        layout,
        'brand',
        [footerState.manifest.SITE.NAME],
    );
    setSeeChenLayoutSlotChildren(
        layout,
        'release',
        createReleaseLayout(footerState.manifest.RELEASE),
    );
    setSeeChenLayoutSlotChildren(
        layout,
        'menu',
        footerState.menuRoutes.map((route, index) => {
            return createMenuLayout(route, index, activeMenu);
        }),
    );
    setSeeChenLayoutSlotChildren(
        layout,
        'social',
        getVisibleSocialItems().map(createSocialLayout),
    );
    setSeeChenLayoutSlotChildren(
        layout,
        'domain',
        [footerState.manifest.SITE.DOMAIN],
    );

    return vDom.create(layout);
}

/**
 * Handles internal route links through the Router service.
 * @param {!MouseEvent} event
 */
function handleClick(event) {
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

    if (!(event.target instanceof Element)) {
        return;
    }

    const routeLink = event.target.closest('[data-seechen-route]');

    if (!routeLink) {
        return;
    }

    event.preventDefault();
    router.navigate(routeLink.dataset.seechenRoute).catch((error) => {
        logger.error('Footer navigation failed.', error);
    });
}

/**
 * Registers one delegated listener on the Footer region.
 */
function registerEvents() {
    if (clickCleanup) {
        clickCleanup();
    }

    const root = SEECHEN_REGION_MANAGER.getRoot(REGION_NAME);
    root.addEventListener('click', handleClick);
    clickCleanup = () => {
        root.removeEventListener('click', handleClick);
        clickCleanup = null;
    };
}

/**
 * Updates the Footer after crossing a configured viewport breakpoint.
 */
function handleViewportChange() {
    if (!footerState) {
        return;
    }

    SEECHEN_REGION_MANAGER.update(
        REGION_NAME,
        createFooterVDom(footerState.activeMenu),
    );
}

/**
 * Registers one shared responsive-service subscription.
 */
function registerResponsiveEvents() {
    if (responsiveCleanup) {
        responsiveCleanup();
    }

    responsiveCleanup = SEECHEN_RESPONSIVE.subscribe(handleViewportChange);
}

export const SEECHEN_FOOTER = {
    /**
     * Loads Footer resources and renders its initial route state.
     * @param {!Object} initialRoute
     * @return {!Promise<void>}
     */
    async render(initialRoute) {
        await Promise.all([
            SEECHEN_COMPONENTS.register(COMPONENT_NAME),
            ...I18N_NAMESPACES.map((namespace) => {
                return SEECHEN_I18N.loadNamespace(namespace);
            }),
        ]);

        const [manifest, menuRoutes, socialItems] = await Promise.all([
            SEECHEN_SITE_MANIFEST.get(),
            SEECHEN_SITE_MANIFEST.getMenuRoutes(),
            SEECHEN_SITE_MANIFEST.getSocialItems(),
        ]);

        footerState = {
            manifest,
            menuRoutes,
            socialItems,
            activeMenu: initialRoute.activeMenu,
        };

        SEECHEN_REGION_MANAGER.render(
            REGION_NAME,
            createFooterVDom(initialRoute.activeMenu),
        );
        registerEvents();
        registerResponsiveEvents();
        logger.info('Footer rendered.');
    },

    /**
     * Updates route-dependent Footer state through vDOM diffing.
     * @param {!Object} routeResult
     */
    update(routeResult) {
        if (!footerState) {
            return;
        }

        footerState.activeMenu = routeResult.activeMenu;
        SEECHEN_REGION_MANAGER.update(
            REGION_NAME,
            createFooterVDom(footerState.activeMenu),
        );
    },

    /**
     * Destroys Footer events, region content, and runtime state.
     */
    destroy() {
        if (clickCleanup) {
            clickCleanup();
        }

        if (responsiveCleanup) {
            responsiveCleanup();
            responsiveCleanup = null;
        }

        SEECHEN_REGION_MANAGER.clear(REGION_NAME);
        footerState = null;
    },
};
