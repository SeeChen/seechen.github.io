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
 * @fileoverview Runtime application context for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';

export const SEECHEN_WEBPAGE_CONTEXT = {
    LANGUAGE: {
        CURRENT: '',
        TRANSLATIONS: {},
    },

    PAGE: {
        CURRENT: null,
        CURRENT_VDOM: null,
    },

    COMPONENTS: {
        REGISTERED: {},
    },
};

export const SEECHEN_WEBPAGE_VALUES = {
    REGISTRY: SEECHEN_WEBPAGE_CONFIG.REGISTRY,

    // TODO: Remove after all legacy references use REGISTRY.
    REGISTERY: SEECHEN_WEBPAGE_CONFIG.REGISTRY,

    LANGUAGE: {
        get LANGUAGE() {
            return SEECHEN_WEBPAGE_CONTEXT.LANGUAGE.CURRENT;
        },

        set LANGUAGE(locale) {
            SEECHEN_WEBPAGE_CONTEXT.LANGUAGE.CURRENT = locale;
        },

        get OBJECT() {
            return SEECHEN_WEBPAGE_CONTEXT.LANGUAGE.TRANSLATIONS;
        },

        set OBJECT(translations) {
            SEECHEN_WEBPAGE_CONTEXT.LANGUAGE.TRANSLATIONS = translations;
        },
    },
};
