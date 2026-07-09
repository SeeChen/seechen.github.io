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
        CURRENT_ROUTE: null,
        CURRENT_VDOM: null,
        STATE: null,
        ABORT_CONTROLLER: null,
        EVENT_SCOPE: '',
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
