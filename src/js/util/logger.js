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
 * @fileoverview Core Logging Utility.
 * Environment-aware logger that suppresses debug logs in production
 * (seechen.com), but allows them in local development and GitHub Pages
 * (seechen.github.io).
 */

const LOG_LEVEL = Object.freeze({
    DEBUG: 'DEBUG',
    INFO: 'INFO',
});

class Logger {
    constructor() {
        const hostname = window.location.hostname;

        this.isProduction =
            hostname === 'seechen.com' || hostname === 'www.seechen.com';

        this.level = this.isProduction ? LOG_LEVEL.INFO : LOG_LEVEL.DEBUG;
    }

    /**
     * Checks whether debug logging is enabled.
     * @return {boolean}
     */
    isDebugEnabled() {
        return this.level === LOG_LEVEL.DEBUG;
    }

    /**
     * Gets the current timestamp in YYYY-MM-DD HH:MM:SS format.
     * @return {string}
     */
    #getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Formats a console message.
     * @param {string} level
     * @param {string} message
     * @return {string}
     */
    #getFormat(level, message) {
        return `%c[${level}] ${this.#getTimestamp()}%c ${message}`;
    }

    /**
     * Logs an information message.
     * @param {string} message
     * @param {...*} args
     */
    info(message, ...args) {
        console.log(
            this.#getFormat('INFO', message),
            'color: #1aa260; font-weight: bold;',
            'color: inherit;',
            ...args,
        );
    }

    /**
     * Logs a warning message.
     * @param {string} message
     * @param {...*} args
     */
    warn(message, ...args) {
        console.warn(
            this.#getFormat('WARN', message),
            'color: #ffc107; font-weight: bold;',
            'color: inherit;',
            ...args,
        );
    }

    /**
     * Logs an error message.
     * @param {string} message
     * @param {...*} args
     */
    error(message, ...args) {
        console.error(
            this.#getFormat('ERROR', message),
            'color: #dc3545; font-weight: bold;',
            'color: inherit;',
            ...args,
        );
    }

    /**
     * Logs a debug message.
     * @param {string} message
     * @param {...*} args
     */
    debug(message, ...args) {
        if (!this.isDebugEnabled()) {
            return;
        }

        console.log(
            this.#getFormat('DEBUG', message),
            'color: #808080; font-weight: bold;',
            'color: inherit;',
            ...args,
        );
    }
}

export const logger = new Logger();
