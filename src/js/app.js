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
 * @fileoverview Main application bootstrap for SeeChen Website.
 */

import { SEECHEN_COMPONENTS } from './core/component-registry.js';
import { SEECHEN_WEBPAGE_CONTEXT } from './core/app-context.js';
import { SEECHEN_PAGE_MANAGER } from './core/page-manager.js';
import { router } from './core/route.js';
import { logger } from './util/logger.js';
import { UserLanguage } from './util/language.js';

/**
 * Initializes runtime language settings.
 */
function initLanguage() {
    SEECHEN_WEBPAGE_CONTEXT.LANGUAGE.CURRENT = new UserLanguage().getLanguage();
}

/**
 * Starts the website application.
 * @return {!Promise<void>}
 */
async function bootstrapSeeChenApp() {
    logger.info(`Website URL: ${window.location.href}`);

    initLanguage();
    await SEECHEN_COMPONENTS.registerConfiguredComponents();

    router.setRouteHandler(async (routeResult) => {
        await SEECHEN_PAGE_MANAGER.navigate(routeResult);
    });

    await router.route(window.location.pathname);
}

window.addEventListener('load', () => {
    bootstrapSeeChenApp().catch((error) => {
        logger.error('Failed to bootstrap SeeChen Website.', error);
    });
});
