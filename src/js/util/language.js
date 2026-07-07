/**
 * seechen.github.io
 * https://github.com/SeeChen/seechen.github.io
 * 
 * @file language.js
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
 * @fileoverview Core Language Utility.
 */

import { logger } from './logger.js';

const DEFAULT_LOCALE = 'en_US';
const SUPPORTED_LOCALES = Object.freeze(['zh_CN', 'en_US']);
const LANGUAGE_COOKIE_NAME = 'userLanguage';
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export class UserLanguage {
    /**
     * Formats the browser language to a supported locale.
     * @param {string} browserLanguage
     * @return {string}
     */
    #formatLocale(browserLanguage) {
        let locale = browserLanguage.replaceAll('-', '_');
        logger.debug(`Browser language: ${browserLanguage} | Locale: ${locale}`);

        const parts = locale.split('_');
        if (parts.length === 2) {
            locale = `${parts[0]}_${parts[1].toUpperCase()}`;
        }

        const supported = this.#isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
        logger.debug(`Formatted locale: ${supported}`);
        return supported;
    }

    /**
     * Checks whether a locale is supported.
     * @param {string} locale
     * @return {boolean}
     */
    #isSupportedLocale(locale) {
        return SUPPORTED_LOCALES.includes(locale);
    }

    /**
     * Gets the user language from the cookie or browser settings.
     * @return {string}
     */
    getLanguage() {
        const cookieMatch = document.cookie.match(
            new RegExp(`${LANGUAGE_COOKIE_NAME}=([^;]+)`),
        );

        let detected;
        if (cookieMatch) {
            logger.info(`User language from cookie: ${cookieMatch[1]}`);
            if (this.#isSupportedLocale(cookieMatch[1])) {
                logger.debug(`User language is supported: ${cookieMatch[1]}`);
                return cookieMatch[1];
            }
            logger.warn(`User language is not supported: ${cookieMatch[1]}`);
            detected = DEFAULT_LOCALE;
        } else {
            detected = this.#formatLocale(navigator.language);
            logger.info(`User language from browser: ${detected}`);
        }

        this.setLanguage(detected);
        return detected;
    }

    /**
     * Sets the user language.
     * @param {string} language
     */
    setLanguage(language) {
        const locale = this.#isSupportedLocale(language) ? language : DEFAULT_LOCALE;
        logger.debug(`Setting user language: ${locale}`);
        document.cookie =
            `${LANGUAGE_COOKIE_NAME}=${locale};max-age=${COOKIE_MAX_AGE_SECONDS};path=/`;
    }
}
