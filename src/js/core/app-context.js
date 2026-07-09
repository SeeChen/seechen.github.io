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

export const SEECHEN_WEBPAGE_CONTEXT = {
    LANGUAGE: {
        CURRENT: '',
        TRANSLATIONS: {},
    },

    PAGE: {
        CURRENT: null,
        CURRENT_ROUTE: null,
        CURRENT_VDOM: null,
        CURRENT_REGION: '',
        STATE: null,
        ABORT_CONTROLLER: null,
        EVENT_SCOPE: '',
    },

    REGIONS: {
        ELEMENTS: {},
        CURRENT_VDOM: {},
    },

    COMPONENTS: {
        REGISTERED: {},
    },
};
