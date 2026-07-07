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
 * @fileoverview Component registry for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { SEECHEN_WEBPAGE_CONTEXT } from './app-context.js';
import { SEECHEN_LAYOUT } from '../repositories/layout-repository.js';
import { SEECHEN_RESOURCE } from '../services/resource.js';
import { logger } from '../util/logger.js';
import { vDom } from './vDom.js';

const COMPONENT_LOADERS = new Map();

/**
 * Checks whether a value is a non-empty string.
 * @param {*} value
 * @return {boolean}
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

/**
 * Normalizes a component name.
 * @param {string} name
 * @return {string}
 */
function normalizeComponentName(name) {
    if (!isNonEmptyString(name)) {
        throw new TypeError('Component name must be a non-empty string.');
    }

    return name.trim().toUpperCase();
}

/**
 * Gets the runtime component store.
 * @return {!Object}
 */
function getComponentStore() {
    return SEECHEN_WEBPAGE_CONTEXT.COMPONENTS.REGISTERED;
}

/**
 * Gets all configured component names.
 * @return {!Array<string>}
 */
function getConfiguredComponentNames() {
    return Object.keys(SEECHEN_WEBPAGE_CONFIG.REGISTRY.COMPONENTS_LAYOUT);
}

export const SEECHEN_COMPONENTS = {
    /**
     * Registers a configured component.
     * @param {string} name
     * @return {!Promise<!Object>}
     */
    async register(name) {
        const componentName = normalizeComponentName(name);
        const componentStore = getComponentStore();

        if (componentStore[componentName]) {
            logger.debug(`Component already registered: ${componentName}`);
            return componentStore[componentName];
        }

        if (COMPONENT_LOADERS.has(componentName)) {
            logger.debug(`Component is already registering: ${componentName}`);
            return COMPONENT_LOADERS.get(componentName);
        }

        logger.debug(`Registering component: ${componentName}`);
        const loader = (async () => {
            const layout = await SEECHEN_LAYOUT.getComponentLayout(componentName);
            const stylePath = SEECHEN_LAYOUT.getComponentStylePath(componentName);

            if (stylePath) {
                await SEECHEN_RESOURCE.loadStyle(stylePath);
            }

            vDom.registerComponent(componentName, layout);
            componentStore[componentName] = layout;
            COMPONENT_LOADERS.delete(componentName);
            return layout;
        })().catch((error) => {
            COMPONENT_LOADERS.delete(componentName);
            logger.error(`Failed to register component: ${componentName}`, error);
            throw error;
        });

        COMPONENT_LOADERS.set(componentName, loader);
        return loader;
    },

    /**
     * Registers all configured components.
     * @return {!Promise<!Array<!Object>>}
     */
    async registerConfiguredComponents() {
        return Promise.all(
            getConfiguredComponentNames().map((name) => this.register(name)),
        );
    },

    /**
     * Checks whether a component is registered.
     * @param {string} name
     * @return {boolean}
     */
    has(name) {
        const componentName = normalizeComponentName(name);
        return Boolean(getComponentStore()[componentName]);
    },

    /**
     * Gets a registered component layout.
     * @param {string} name
     * @return {?Object}
     */
    get(name) {
        const componentName = normalizeComponentName(name);
        return getComponentStore()[componentName] || null;
    },

    /**
     * Clears registered component state.
     */
    clear() {
        Object.keys(getComponentStore()).forEach((name) => {
            delete getComponentStore()[name];
        });

        COMPONENT_LOADERS.clear();
        vDom.components = {};
    },
};
