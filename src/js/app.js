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

import { vDom } from "./core/vDom.js";
import { EventAgent } from "./middleware/eventAgent.js";
import { logger } from "./util/logger.js";
import { UserLanguage } from "./util/language.js";

import { SEECHEN_WEBPAGE_VALUES } from "./core/app-context.js";

window.onload = async function () {
    registerComponents();

    const link = this.document.createElement("link");
    link.rel = "stylesheet";
    link.href = SEECHEN_WEBPAGE_VALUES.REGISTERY.STYLE_PATH.LOADING;
    this.document.head.appendChild(link);

    logger.info(`Websites URL: ${window.location.href}`);

    SEECHEN_WEBPAGE_VALUES.LANGUAGE.LANGUAGE = new UserLanguage().getLanguage();

    const loadingLayout = await fetch(SEECHEN_WEBPAGE_VALUES.REGISTERY.PAGES_LAYOUT.LOADING).then(res => res.json());
    const loadingVDom = vDom.create(loadingLayout);
    const loadingElement = vDom.render(loadingVDom);
    document.getElementById("componentLoading").appendChild(loadingElement);
}

async function registerComponents() {

    Object.keys(SEECHEN_WEBPAGE_VALUES.REGISTERY.COMPONENTS_LAYOUT).forEach(async element => {
        logger.debug(`Registering component: ${element}`);
        const layout = await fetch(SEECHEN_WEBPAGE_VALUES.REGISTERY.COMPONENTS_LAYOUT[element].PATH).then(res => res.json());
        vDom.registerComponent(element, layout);

        const link = window.document.createElement("link");
        link.rel = "stylesheet";
        link.href = SEECHEN_WEBPAGE_VALUES.REGISTERY.COMPONENTS_LAYOUT[element].SYTLE;
        window.document.head.appendChild(link);
    });
}