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
 * @fileoverview Shared type helpers for SeeChen Website.
 */

/**
 * Checks whether a value is a non-empty string.
 * @param {*} value
 * @return {boolean}
 */
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

/**
 * Checks whether a value is a plain object.
 * @param {*} value
 * @return {boolean}
 */
export function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value === 'object' &&
        Object.getPrototypeOf(value) === Object.prototype,
    );
}

/**
 * Checks whether an object owns a key.
 * @param {?Object} target
 * @param {string} key
 * @return {boolean}
 */
export function hasOwn(target, key) {
    return Boolean(
        target &&
        Object.prototype.hasOwnProperty.call(target, key),
    );
}

/**
 * Deeply freezes a SeeChen configuration or manifest value.
 * @param {*} target
 * @return {*}
 */
export function freezeSeeChenObject(target) {
    if (!target || typeof target !== 'object' || Object.isFrozen(target)) {
        return target;
    }

    Object.values(target).forEach((value) => {
        freezeSeeChenObject(value);
    });

    return Object.freeze(target);
}

/**
 * Clones a JSON-compatible SeeChen object.
 * @param {*} target
 * @return {*}
 */
export function cloneSeeChenObject(target) {
    if (typeof structuredClone === 'function') {
        return structuredClone(target);
    }

    return JSON.parse(JSON.stringify(target));
}
