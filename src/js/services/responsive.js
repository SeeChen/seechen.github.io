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
 * @fileoverview Shared viewport breakpoint service for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';

export const SEECHEN_VIEWPORT = Object.freeze({
    MOBILE: 'MOBILE',
    TABLET: 'TABLET',
    DESKTOP: 'DESKTOP',
});

const BREAKPOINTS = SEECHEN_WEBPAGE_CONFIG.RESPONSIVE.BREAKPOINTS;
const TABLET_QUERY = window.matchMedia(
    `(min-width: ${BREAKPOINTS.TABLET_MIN_WIDTH}px)`,
);
const DESKTOP_QUERY = window.matchMedia(
    `(min-width: ${BREAKPOINTS.DESKTOP_MIN_WIDTH}px)`,
);
const SUBSCRIBERS = new Set();

let currentViewport = '';
let isListening = false;

/**
 * Resolves the current named viewport.
 * @return {string}
 */
function resolveViewport() {
    if (DESKTOP_QUERY.matches) {
        return SEECHEN_VIEWPORT.DESKTOP;
    }

    if (TABLET_QUERY.matches) {
        return SEECHEN_VIEWPORT.TABLET;
    }

    return SEECHEN_VIEWPORT.MOBILE;
}

/**
 * Notifies subscribers only when the named viewport changes.
 */
function handleViewportChange() {
    const nextViewport = resolveViewport();

    if (nextViewport === currentViewport) {
        return;
    }

    currentViewport = nextViewport;
    [...SUBSCRIBERS].forEach((listener) => {
        listener(currentViewport);
    });
}

/**
 * Starts shared native media-query listeners.
 */
function startListening() {
    if (isListening) {
        return;
    }

    TABLET_QUERY.addEventListener('change', handleViewportChange);
    DESKTOP_QUERY.addEventListener('change', handleViewportChange);
    isListening = true;
}

/**
 * Stops native listeners when the service has no subscribers.
 */
function stopListeningWhenIdle() {
    if (!isListening || SUBSCRIBERS.size > 0) {
        return;
    }

    TABLET_QUERY.removeEventListener('change', handleViewportChange);
    DESKTOP_QUERY.removeEventListener('change', handleViewportChange);
    isListening = false;
}

export const SEECHEN_RESPONSIVE = {
    /**
     * Gets the current named viewport.
     * @return {string}
     */
    getCurrentViewport() {
        currentViewport = resolveViewport();
        return currentViewport;
    },

    /**
     * Subscribes to named viewport changes.
     * @param {Function} listener
     * @return {Function}
     */
    subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Responsive listener must be a function.');
        }

        SUBSCRIBERS.add(listener);
        currentViewport = resolveViewport();
        startListening();

        return () => {
            SUBSCRIBERS.delete(listener);
            stopListeningWhenIdle();
        };
    },
};
