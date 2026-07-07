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
 * @fileoverview Core Routing Utility.
 * Handles client-side routing for the Single Page Application (SPA).
 */

window.addEventListener("popstate", () => {
    router.route(window.location.pathname, false);
});


export const router = {
    route: async (path, executed = true) => {

    }
}