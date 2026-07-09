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
 * @fileoverview Generic paginated repository for SeeChen Website.
 */

import { SEECHEN_WEBPAGE_CONFIG } from '../config/app-config.js';
import { SEECHEN_RESOURCE } from '../services/resource.js';

/**
 * Checks whether a value is a non-empty string.
 * @param {*} value
 * @return {boolean}
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

/**
 * Checks whether a value is a plain object.
 * @param {*} value
 * @return {boolean}
 */
function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value === 'object' &&
        Object.getPrototypeOf(value) === Object.prototype,
    );
}

/**
 * Gets a response value by trying multiple common field names.
 * @param {!Object} response
 * @param {!Array<string>} keys
 * @return {*}
 */
function getFirstValue(response, keys) {
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(response, key)) {
            return response[key];
        }
    }

    return undefined;
}

/**
 * Normalizes a cursor as a local array offset.
 * @param {?string|number=} cursor
 * @return {number}
 */
function normalizeOffset(cursor = null) {
    const offset = Number(cursor || 0);

    if (!Number.isFinite(offset) || offset < 0) {
        return 0;
    }

    return offset;
}

/**
 * Reads one page from a local static JSON array.
 * @param {!Array<*>} items
 * @param {?string|number=} cursor
 * @param {number} limit
 * @return {{items: !Array<*>, nextCursor: ?string, hasMore: boolean, raw: *}}
 */
function normalizeLocalArrayResult(items, cursor, limit) {
    const offset = normalizeOffset(cursor);
    const nextOffset = offset + limit;
    const pageItems = items.slice(offset, nextOffset);
    const hasMore = nextOffset < items.length;

    return {
        items: pageItems,
        nextCursor: hasMore ? String(nextOffset) : null,
        hasMore,
        raw: items,
    };
}

/**
 * Normalizes static JSON and API pagination responses.
 * @param {*} response
 * @param {number} limit
 * @return {{items: !Array<*>, nextCursor: ?string, hasMore: boolean, raw: *}}
 */
export function normalizePaginatedResult(response, limit) {
    if (Array.isArray(response)) {
        return {
            items: response,
            nextCursor: null,
            hasMore: response.length >= limit,
            raw: response,
        };
    }

    if (!isPlainObject(response)) {
        return {
            items: [],
            nextCursor: null,
            hasMore: false,
            raw: response,
        };
    }

    const items = getFirstValue(response, ['items', 'data', 'results']) || [];
    const nextCursor = getFirstValue(
        response,
        ['nextCursor', 'next_cursor', 'cursor'],
    ) || null;
    const hasMore = getFirstValue(response, ['hasMore', 'has_more']);

    return {
        items: Array.isArray(items) ? items : [],
        nextCursor,
        hasMore: typeof hasMore === 'boolean' ? hasMore : Boolean(nextCursor),
        raw: response,
    };
}

export class SeeChenPaginatedRepository {
    /**
     * Creates a paginated repository.
     * @param {{
     *     path: string,
     *     baseUrl: string=,
     *     query: !Object=,
     *     limit: number=,
     *     mapItem: Function=,
     * }=} options
     */
    constructor(options = {}) {
        if (!isNonEmptyString(options.path)) {
            throw new TypeError('Paginated repository path must be a non-empty string.');
        }

        this.path = options.path;
        this.baseUrl = options.baseUrl === undefined ?
            SEECHEN_WEBPAGE_CONFIG.API.BASE_URL :
            options.baseUrl;
        this.query = options.query || {};
        this.limit = options.limit || SEECHEN_WEBPAGE_CONFIG.DATA.DEFAULT_PAGE_LIMIT;
        this.mapItem = options.mapItem || ((item) => item);
    }

    /**
     * Lists one page of data.
     * @param {{
     *     cursor: ?string=,
     *     limit: number=,
     *     query: !Object=,
     *     signal: ?AbortSignal=,
     * }=} options
     * @return {!Promise<{
     *     items: !Array<*>,
     *     nextCursor: ?string,
     *     hasMore: boolean,
     *     raw: *,
     * }>}
     */
    async list(options = {}) {
        const limit = options.limit || this.limit;
        const cursor = options.cursor || null;
        const query = {
            ...this.query,
            ...(options.query || {}),
            limit,
        };

        if (cursor) {
            query.cursor = cursor;
        }

        const response = await SEECHEN_RESOURCE.getJson(this.path, {
            baseUrl: this.baseUrl,
            query,
            signal: options.signal || null,
        });

        if (Array.isArray(response) && !this.baseUrl) {
            const result = normalizeLocalArrayResult(response, cursor, limit);

            return {
                ...result,
                items: result.items.map(this.mapItem),
            };
        }

        const result = normalizePaginatedResult(response, limit);

        return {
            ...result,
            items: result.items.map(this.mapItem),
        };
    }
}

/**
 * Creates a paginated repository instance.
 * @param {!Object} options
 * @return {!SeeChenPaginatedRepository}
 */
export function createPaginatedRepository(options) {
    return new SeeChenPaginatedRepository(options);
}
