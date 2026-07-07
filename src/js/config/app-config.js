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
            ROOT: '/public/i18n',
            LOADING: 'general/loading',
        },

        STYLE_PATH: {
            GLOBAL: '/src/style/core/global.css',
            APP: '/src/style/app.css',
            LOADING: '/src/style/pages/loading.css',
        },
    },
});
