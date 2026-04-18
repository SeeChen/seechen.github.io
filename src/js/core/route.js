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