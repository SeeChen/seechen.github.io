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
 * @fileoverview Static application configuration for SeeChen Website.
 */

import { freezeSeeChenObject } from '../util/type.js';

export const SEECHEN_WEBPAGE_CONFIG = freezeSeeChenObject({
    API: {
        BASE_URL: '',
        TIMEOUT_MS: 15000,
    },

    DATA: {
        DEFAULT_PAGE_LIMIT: 10,
    },

    RESPONSIVE: {
        BREAKPOINTS: {
            TABLET_MIN_WIDTH: 768,
            DESKTOP_MIN_WIDTH: 1200,
        },
    },

    REGISTRY: {
        SITE_MANIFEST: '/public/config/site-manifest.json',

        PAGES_LAYOUT: {
            LOADING: '/public/layouts/global/loading.json',
            HOME: '/public/layouts/pages/home.json',
            TRAVEL: '/public/layouts/pages/travel.json',
            NOT_FOUND: '/public/layouts/pages/not-found.json',
        },

        COMPONENTS_LAYOUT: {
            LOADING_DOT: {
                PATH: '/public/layouts/components/loading-dot.json',
                STYLE: '/src/style/components/loading-dot.css',
            },
            NAVIGATION: {
                PATH: '/public/layouts/components/navigation.json',
                STYLE: '/src/style/components/navigation.css',
            },
            FOOTER: {
                PATH: '/public/layouts/components/footer.json',
                STYLE: '/src/style/components/footer.css',
            },
        },

        LANGUAGE_PATH: {
            ROOT: '/public/i18n',
            LOADING: 'general/loading',
            SHELL: 'general/shell',
            FOOTER: 'general/footer',
        },

        STYLE_PATH: {
            GLOBAL: '/src/style/core/global.css',
            APP: '/src/style/app.css',
            LOADING: '/src/style/pages/loading.css',
        },
    },

    APP_SHELL: {
        REGIONS: {
            LOADING: {
                SELECTOR: '#componentLoading',
            },

            NAVIGATION: {
                SELECTOR: '#componentNavigation',
                HIDE_WHEN_EMPTY: true,
            },

            BODY: {
                SELECTOR: '#componentBody',
            },

            FOOTER: {
                SELECTOR: '#componentFooter',
                HIDE_WHEN_EMPTY: true,
            },
        },
    },

    PAGES: {
        DEFAULT_REGION: 'BODY',

        HOME: {
            REGION: 'BODY',
            LAYOUT: 'HOME',
            STYLE: '',
            SCRIPT: '',
            I18N: [],
            EVENT_SCOPE: 'PAGE:HOME',
        },

        LOADING: {
            REGION: 'LOADING',
            LAYOUT: 'LOADING',
            STYLE: '/src/style/pages/loading.css',
            SCRIPT: '',
            I18N: ['LOADING'],
            EVENT_SCOPE: 'PAGE:LOADING',
        },

        TRAVEL: {
            REGION: 'BODY',
            LAYOUT: 'TRAVEL',
            STYLE: '',
            SCRIPT: '',
            I18N: [],
            EVENT_SCOPE: 'PAGE:TRAVEL',
        },

        NOT_FOUND: {
            REGION: 'BODY',
            LAYOUT: 'NOT_FOUND',
            STYLE: '',
            SCRIPT: '',
            I18N: [],
            EVENT_SCOPE: 'PAGE:NOT_FOUND',
        },
    },

    ROUTER: {
        PRESERVE_ORIGINAL_URL: true,
        NOT_FOUND_ROUTE: 'NOT_FOUND',
    },
});
