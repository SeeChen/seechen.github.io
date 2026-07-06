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
    REGISTRY: {
        PAGES_LAYOUT: {
            LOADING: '/public/layouts/global/loading.json',
        },

        COMPONENTS_LAYOUT: {
            LOADING_DOT: {
                PATH: '/public/layouts/components/loading-dot.json',
                STYLE: '/src/style/components/loading-dot.css',

                // TODO: Remove after all legacy references use STYLE.
                SYTLE: '/src/style/components/loading-dot.css',
            },
        },

        LANGUAGE_PATH: {
            LOADING: '/public/i18n/general/loading/',
        },

        STYLE_PATH: {
            GLOBAL: '/src/style/core/global.css',
            APP: '/src/style/app.css',
            LOADING: '/src/style/pages/loading.css',
        },
    },
});
