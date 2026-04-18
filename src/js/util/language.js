/**
 * seechen.github.io
 * https://github.com/SeeChen/seechen.github.io
 * 
 * @file language.js
 *
 * Copyright (c) 2024-2026 LEE SEE CHEN. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * @fileoverview Core Language Utility.
 */

import { logger } from "../core/logger.js";

export class UserLanguage {
    /** @private @const {string} */
    #defaultLocale = 'en_US';

    /** @private @const {!Array<string>} */
    #supportLocales = ['zh_CN', 'en_US'];

    constructor() { }

    /**
     * Format the browser language to the supported locale
     * @param {string} browserLanguage
     * @returns {string}
     */
    #formatLocale(browserLanguage) {
        // 1. From en-US to en_US
        let locale = browserLanguage.replace('-', '_');
        logger.debug(`Browser language: ${browserLanguage} | Locale: ${locale}`);

        // 2. Format the locale to en_US
        const parts = locale.split('_');
        if (parts.length === 2) {
            locale = `${parts[0]}_${parts[1].toUpperCase()}`;
        }

        // 3. Check if the language is supported
        const supported = this.#supportLocales.includes(locale) ? locale : this.#defaultLocale;
        logger.debug(`Formatted locale: ${supported}`);
        return supported;
    }

    /**
     * Get the user language from the cookie
     * @returns {string}
     */
    getLanguage() {
        const cookieMatch = document.cookie.match(/userLanguage=([^;]+)/);

        let detected;
        if (cookieMatch) {
            logger.info(`User language from cookie: ${cookieMatch[1]}`);
            if (this.#supportLocales.includes(cookieMatch[1])) {
                logger.debug(`User language is supported: ${cookieMatch[1]}`);
                return cookieMatch[1];
            }
            logger.warn(`User language is not supported: ${cookieMatch[1]}`);
            detected = this.#defaultLocale;
        } else {
            detected = this.#formatLocale(navigator.language);
            logger.info(`User language from browser: ${detected}`);
        }
        this.setLanguage(detected);
        return detected;
    }

    /**
     * Set the user language
     * @param {string} language
     */
    setLanguage(language) {
        logger.debug(`Setting user language: ${language}`);
        const maxAge = 30 * 24 * 60 * 60;
        document.cookie = `userLanguage=${language};max-age=${maxAge};path=/`;
    }
}
