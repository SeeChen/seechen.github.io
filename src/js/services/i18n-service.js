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
 * @fileoverview Translation resource service for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { SEECHEN_WEBPAGE_CONTEXT } from '../core/app-context.js';
import { logger } from '../util/logger.js';
import { SEECHEN_RESOURCE } from './resource.js';

const DEFAULT_LOCALE = 'en_US';
const NAMESPACE_LOADERS = new Map();

/**
 * Checks whether a value is a non-empty string.
 * @param {*} value
 * @return {boolean}
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

/**
 * Gets the active locale.
 * @param {string=} locale
 * @return {string}
 */
function getLocale(locale = '') {
    if (isNonEmptyString(locale)) {
        return locale;
    }

    // Use the runtime language when the caller does not provide one.
    return SEECHEN_WEBPAGE_CONTEXT.LANGUAGE.CURRENT || DEFAULT_LOCALE;
}

/**
 * Gets the configured path segment for a namespace.
 * @param {string} namespace
 * @return {string}
 */
function getNamespacePath(namespace) {
    const languagePath = SEECHEN_WEBPAGE_CONFIG.REGISTRY.LANGUAGE_PATH;
    const configuredPath = languagePath[namespace.toUpperCase()];

    return configuredPath || namespace;
}

/**
 * Builds the resource path for a namespace and locale.
 * @param {string} namespace
 * @param {string} locale
 * @return {string}
 */
function buildResourcePath(namespace, locale) {
    const root = SEECHEN_WEBPAGE_CONFIG.REGISTRY.LANGUAGE_PATH.ROOT;

    // The return will be like: '/public/i18n/general/home/en_US.json'
    return `${root}/${getNamespacePath(namespace)}/${locale}.json`;
}

/**
 * Gets the translation store for a locale.
 * @param {string} locale
 * @return {!Object}
 */
function getLocaleStore(locale) {
    const translations = SEECHEN_WEBPAGE_CONTEXT.LANGUAGE.TRANSLATIONS;

    if (!translations[locale]) {
        translations[locale] = {};
    }

    return translations[locale];
}

/**
 * Checks whether an object owns a key.
 * @param {?Object} target
 * @param {string} key
 * @return {boolean}
 */
function hasOwn(target, key) {
    return Boolean(
        target && Object.prototype.hasOwnProperty.call(target, key),
    );
}

export const SEECHEN_I18N = {
    /**
     * Loads a translation namespace for a locale.
     * @param {string} namespace
     * @param {string=} locale
     * @return {!Promise<!Object>}
     */
    async loadNamespace(namespace, locale = '') {
        if (!isNonEmptyString(namespace)) {
            throw new TypeError('I18n namespace must be a non-empty string.');
        }

        const targetLocale = getLocale(locale);
        const localeStore = getLocaleStore(targetLocale);

        if (localeStore[namespace]) {
            logger.debug(`I18n namespace already loaded: ${targetLocale}/${namespace}`);
            return localeStore[namespace];
        }

        const loaderKey = `${targetLocale}:${namespace}`;
        if (NAMESPACE_LOADERS.has(loaderKey)) {
            logger.debug(`I18n namespace is already loading: ${loaderKey}`);
            return NAMESPACE_LOADERS.get(loaderKey);
        }

        const resourcePath = buildResourcePath(namespace, targetLocale);
        logger.debug(`Loading i18n namespace: ${resourcePath}`);

        const loader = SEECHEN_RESOURCE.getJson(resourcePath)
            .then((data) => {
                localeStore[namespace] = data;
                NAMESPACE_LOADERS.delete(loaderKey);
                return data;
            })
            .catch((error) => {
                NAMESPACE_LOADERS.delete(loaderKey);
                logger.error(`Failed to load i18n namespace: ${loaderKey}`, error);
                throw error;
            });

        NAMESPACE_LOADERS.set(loaderKey, loader);
        return loader;
    },

    /**
     * Gets a translated string.
     * @param {string} namespace
     * @param {string} key
     * @param {string=} locale
     * @return {string}
     */
    t(namespace, key, locale = '') {
        const targetLocale = getLocale(locale);
        const localeStore = getLocaleStore(targetLocale);
        const namespaceStore = localeStore[namespace];

        if (!hasOwn(namespaceStore, key)) {
            logger.warn(`Missing i18n key: ${targetLocale}/${namespace}.${key}`);
            return key;
        }

        return namespaceStore[key];
    },

    /**
     * Checks whether a translation key exists.
     * @param {string} namespace
     * @param {string} key
     * @param {string=} locale
     * @return {boolean}
     */
    has(namespace, key, locale = '') {
        const targetLocale = getLocale(locale);
        const localeStore = getLocaleStore(targetLocale);
        return hasOwn(localeStore[namespace], key);
    },
};
