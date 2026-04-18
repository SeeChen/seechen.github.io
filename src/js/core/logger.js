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
 * @fileoverview Core Logging Utility.
 * Environment-aware logger that suppresses logs in production (seechen.com), 
 * but allows them in local development and GitHub Pages (seechen.github.io).
 */

class Logger {
    constructor() {
        // Detect the environment based on the URL hostname
        const hostname = window.location.hostname;

        // It is considered "Production" if the URL is your final live domain
        this.isProduction = hostname === 'seechen.com' || hostname === 'www.seechen.com';

        // It is considered "Dev" on localhost, 127.0.0.1, or seechen.github.io
        this.isDev = !this.isProduction;
    }

    /**
     * Helper to get timestamp in format YYYY.MM.DD HH:MM:SS
     * @returns {string} 
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

    #getFormat(level, message) {
        return `%c[${level}] ${this.#getTimestamp()}%c ${message}`;
    }

    /**
     * Standard Information Log (Blue)
     * @param {string} message 
     * @param  {...any} args 
     */
    info(message, ...args) {
        console.log(this.#getFormat("INFO", message), 'color: #1aa260; font-weight: bold;', 'color: inherit;', ...args);
    }

    /**
     * Warning Log (Yellow)
     * @param {string} message 
     * @param  {...any} args 
     */
    warn(message, ...args) {
        console.warn(this.#getFormat("WARN", message), 'color: #ffc107; font-weight: bold;', 'color: inherit;', ...args);
    }

    /**
     * Error Log (Red)
     * @param {string} message 
     * @param  {...any} args 
     */
    error(message, ...args) {
        console.error(this.#getFormat("ERROR", message), 'color: #dc3545; font-weight: bold;', 'color: inherit;', ...args);
    }

    /**
     * Debug/Trace Log (Gray)
     * @param {string} message 
     * @param  {...any} args 
     */
    debug(message, ...args) {
        if (this.isDev) {
            console.log(this.#getFormat("DEBUG", message), 'color: #808080; font-weight: bold;', 'color: inherit;', ...args);
        }
    }
}

// Export a single instance to be used globally across modules
export const logger = new Logger();
