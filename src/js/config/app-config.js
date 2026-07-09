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

/**
 * Deeply freezes a configuration object.
 * @param {!Object} target
 * @return {!Object}
 */
function freezeSeeChenConfig(target) {
    Object.values(target).forEach((value) => {
        if (value && typeof value === 'object') {
            freezeSeeChenConfig(value);
        }
    });

    return Object.freeze(target);
}

export const SEECHEN_WEBPAGE_CONFIG = freezeSeeChenConfig({
    API: {
        BASE_URL: '',
        TIMEOUT_MS: 15000,
    },

    DATA: {
        DEFAULT_PAGE_LIMIT: 10,
    },

    REGISTRY: {
        PAGES_LAYOUT: {
            LOADING: '/public/layouts/global/loading.json',
            TRAVEL: '/public/layouts/global/loading.json',
            NOT_FOUND: '/public/layouts/global/loading.json',
        },

        COMPONENTS_LAYOUT: {
            LOADING_DOT: {
                PATH: '/public/layouts/components/loading-dot.json',
                STYLE: '/src/style/components/loading-dot.css',
            },
        },

        LANGUAGE_PATH: {
            ROOT: '/public/i18n',
            LOADING: 'general/loading',
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
            STYLE: '/src/style/pages/loading.css',
            SCRIPT: '',
            I18N: ['LOADING'],
            EVENT_SCOPE: 'PAGE:NOT_FOUND',
        },
    },

    ROUTER: {
        PRESERVE_ORIGINAL_URL: true,
        NOT_FOUND_ROUTE: 'NOT_FOUND',

        ROUTES: [
            {
                NAME: 'HOME',
                PATH: '/',
                PAGE: 'LOADING',
                LAYOUT: 'LOADING',
                TITLE: {
                    NAMESPACE: 'LOADING',
                    KEY: 'SEECHEN',
                },
            },
            {
                NAME: 'TRAVEL',
                PATH: '/travel',
                PAGE: 'TRAVEL',
                LAYOUT: 'TRAVEL',
                TITLE: {
                    NAMESPACE: 'NAVIGATION',
                    KEY: 'TRAVEL',
                },
            },
            {
                NAME: 'TRAVEL_COUNTRY',
                PATH: '/travel/:countryId',
                PAGE: 'TRAVEL',
                LAYOUT: 'TRAVEL',
                PARAMS: {
                    countryId: 'COUNTRY',
                },
                TITLE: {
                    NAMESPACE: 'NAVIGATION',
                    KEY: 'TRAVEL',
                },
            },
            {
                NAME: 'TRAVEL_REGION',
                PATH: '/travel/:countryId/:regionId',
                PAGE: 'TRAVEL',
                LAYOUT: 'TRAVEL',
                PARAMS: {
                    countryId: 'COUNTRY',
                    regionId: 'REGION',
                },
                TITLE: {
                    NAMESPACE: 'NAVIGATION',
                    KEY: 'TRAVEL',
                },
            },
            {
                NAME: 'NOT_FOUND',
                PATH: '*',
                PAGE: 'NOT_FOUND',
                LAYOUT: 'NOT_FOUND',
                TITLE: {
                    NAMESPACE: 'GENERAL',
                    KEY: 'NOT_FOUND',
                },
            },
        ],

        PATH_ALIASES: {
            '/home': '/',
            '/index': '/',
            '/index.html': '/',
            '/主页': '/',
            '/我的主页': '/',
            '/travel': '/travel',
            '/trip': '/travel',
            '/journey': '/travel',
            '/traveling': '/travel',
            '/旅行': '/travel',
            '/旅游': '/travel',
            '/我的旅行': '/travel',
        },

        PARAM_ALIASES: {
            COUNTRY: {
                CN: 'CN',
                CHINA: 'CN',
                中国: 'CN',
                中國: 'CN',
                MY: 'MY',
                MALAYSIA: 'MY',
                马来西亚: 'MY',
                馬來西亞: 'MY',
                SG: 'SG',
                SINGAPORE: 'SG',
                新加坡: 'SG',
            },
            REGION: {
                BEIJING: 'BeiJing',
                北京: 'BeiJing',
                SHANGHAI: 'ShangHai',
                上海: 'ShangHai',
                KL: 'KL',
                KUALA_LUMPUR: 'KL',
                吉隆坡: 'KL',
            },
        },
    },
});
