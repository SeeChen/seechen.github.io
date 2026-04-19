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
 * @filename src/js/core/app-context.js
 * @fileoverview Application Context
 */

export const SEECHEN_WEBPAGE_VALUES = {
    REGISTERY: {
        PAGES_LAYOUT: {
            LOADING: "/public/layouts/global/loading.json"
        },

        COMPONENTS_LAYOUT: {
            LOADING_DOT: {
                PATH: "/public/layouts/components/loading-dot.json",
                SYTLE: "/src/style/components/loading-dot.css"
            }
        },

        LANGUAGE_PATH: {
            LOADING: "/public/i18n/general/loading/"
        },

        STYLE_PATH: {
            GLOBAL: "/src/style/global.css",
            APP: "/src/style/app.css",
            LOADING: "/src/style/pages/loading.css"
        }
    },

    LANGUAGE: {
        LANGUAGE: '',
        OBJECT: ''
    }
}