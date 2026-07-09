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
 * @fileoverview Event broker for managing SeeChen Website listeners.
 */

import { logger } from '../util/logger.js';

const DEFAULT_SENDER = 'Unknown';
const DEFAULT_SCOPE = 'GLOBAL';

class ClassEventAgent {
    /** @type {Map<string, Array<!Object>>} */
    #events = new Map();

    /** @type {number} */
    #nextSubscriptionId = 1;

    constructor() {
        logger.info('EventAgent initialized');
    }

    /**
     * Formats a debug log message.
     * @param {string} message
     * @return {string}
     */
    #formatEventAgentLog(message) {
        const callerInfo = logger.isDebugEnabled() ? this.#getCallerInfo() : '';
        return `[EVENT AGENT] ${message}${callerInfo ? ` | ${callerInfo}` : ''}`;
    }

    /**
     * Gets caller information for debug logs.
     * @return {string}
     */
    #getCallerInfo() {
        const err = new Error();
        const stack = (err.stack || '').split('\n');
        // stack[0] Error
        // stack[1] #getCallerInfo
        // stack[2] #formatEventAgentLog
        // stack[3] real EventAgent method, such as emit/on/off
        // stack[4] external caller
        const callerLine = stack[3] || '';
        const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
            callerLine.match(/at\s+(.*):(\d+):(\d+)/);

        if (match) {
            return match[1] || match[2];
        }

        return 'SeeChen'; // SeeChen is the BEST!!!!
    }

    /**
     * Normalizes subscription options.
     * @param {string|!Object=} options
     * @return {{sender: string, scope: string}}
     */
    #normalizeOptions(options = {}) {
        if (typeof options === 'string') {
            return {
                sender: options,
                scope: DEFAULT_SCOPE,
            };
        }

        if (!options) {
            return {
                sender: DEFAULT_SENDER,
                scope: DEFAULT_SCOPE,
            };
        }

        return {
            sender: options.sender || DEFAULT_SENDER,
            scope: options.scope || DEFAULT_SCOPE,
        };
    }

    /**
     * Creates a subscription record.
     * @param {string} eventName
     * @param {Function} listener
     * @param {Function} runner
     * @param {{sender: string, scope: string}} options
     * @return {!Object}
     */
    #createSubscription(eventName, listener, runner, options) {
        return {
            id: this.#nextSubscriptionId++,
            eventName,
            listener,
            runner,
            sender: options.sender,
            scope: options.scope,
            timers: new Set(),
            active: true,
        };
    }

    /**
     * Adds a subscription to the event registry.
     * @param {!Object} subscription
     */
    #addSubscription(subscription) {
        if (!this.#events.has(subscription.eventName)) {
            logger.debug(
                this.#formatEventAgentLog(
                    `Event ${subscription.eventName} not found, initializing...`,
                ),
            );
            this.#events.set(subscription.eventName, []);
        }

        this.#events.get(subscription.eventName).push(subscription);
        logger.info(
            this.#formatEventAgentLog(
                `Event ${subscription.eventName} registered by ${subscription.sender}`,
            ),
        );
    }

    /**
     * Clears timers owned by a subscription.
     * @param {!Object} subscription
     */
    #clearSubscriptionTimers(subscription) {
        subscription.timers.forEach((timerId) => clearTimeout(timerId));
        subscription.timers.clear();
    }

    /**
     * Removes a subscription.
     * @param {!Object} subscription
     * @param {string=} sender
     */
    #removeSubscription(subscription, sender = DEFAULT_SENDER) {
        if (!subscription.active) {
            return;
        }

        const subscriptions = this.#events.get(subscription.eventName);
        if (!subscriptions) {
            return;
        }

        this.#clearSubscriptionTimers(subscription);
        subscription.active = false;

        const nextSubscriptions = subscriptions.filter((item) => {
            return item.id !== subscription.id;
        });

        if (nextSubscriptions.length > 0) {
            this.#events.set(subscription.eventName, nextSubscriptions);
        } else {
            this.#events.delete(subscription.eventName);
        }

        logger.info(
            this.#formatEventAgentLog(
                `Event ${subscription.eventName} subscription removed by ${sender}`,
            ),
        );
    }

    /**
     * Creates an unsubscribe callback.
     * @param {!Object} subscription
     * @return {Function}
     */
    #createUnsubscribe(subscription) {
        return () => {
            this.#removeSubscription(subscription, subscription.sender);
        };
    }

    /**
     * Registers an event listener.
     * @param {string} eventName
     * @param {Function} listener
     * @param {string|!Object=} options
     * @return {Function}
     */
    on(eventName, listener, options = {}) {
        const normalizedOptions = this.#normalizeOptions(options);
        const subscription = this.#createSubscription(
            eventName,
            listener,
            listener,
            normalizedOptions,
        );

        this.#addSubscription(subscription);
        return this.#createUnsubscribe(subscription);
    }

    /**
     * Removes event listeners that match the original listener.
     * @param {string} eventName
     * @param {Function} listener
     * @param {string=} sender
     */
    off(eventName, listener, sender = DEFAULT_SENDER) {
        const subscriptions = this.#events.get(eventName);
        if (!subscriptions) {
            logger.debug(this.#formatEventAgentLog(`Event ${eventName} not found to remove.`));
            return;
        }

        subscriptions
            .filter((subscription) => subscription.listener === listener)
            .forEach((subscription) => {
                this.#removeSubscription(subscription, sender);
            });
    }

    /**
     * Emits an event.
     * @param {string} eventName
     * @param {*=} data
     * @param {string=} sender
     */
    emit(eventName, data = undefined, sender = DEFAULT_SENDER) {
        const subscriptions = this.#events.get(eventName);
        if (!subscriptions) {
            logger.debug(this.#formatEventAgentLog(`Event ${eventName} not found, cannot emit.`));
            return;
        }

        [...subscriptions].forEach((subscription) => {
            if (!subscription.active) {
                return;
            }

            try {
                subscription.runner(data);
            } catch (error) {
                logger.error(
                    this.#formatEventAgentLog(
                        `Error in listener for event ${eventName} emitted by ${sender}`,
                    ),
                    error,
                );
            }
        });
    }

    /**
     * Registers an event listener that runs once.
     * @param {string} eventName
     * @param {Function} listener
     * @param {string|!Object=} options
     * @return {Function}
     */
    once(eventName, listener, options = {}) {
        const normalizedOptions = this.#normalizeOptions(options);
        let subscription;

        const runner = (data) => {
            listener(data);
            this.#removeSubscription(subscription, 'EventAgent.once');
        };

        subscription = this.#createSubscription(
            eventName,
            listener,
            runner,
            normalizedOptions,
        );

        this.#addSubscription(subscription);
        return this.#createUnsubscribe(subscription);
    }

    /**
     * Registers an event listener that runs after a delay.
     * @param {string} eventName
     * @param {Function} listener
     * @param {number=} wait
     * @param {string|!Object=} options
     * @return {Function}
     */
    delay(eventName, listener, wait = 1000, options = {}) {
        const normalizedOptions = this.#normalizeOptions(options);
        let subscription;

        const runner = (data) => {
            const timerId = setTimeout(() => {
                subscription.timers.delete(timerId);
                listener(data);
            }, wait);

            subscription.timers.add(timerId);
        };

        subscription = this.#createSubscription(
            eventName,
            listener,
            runner,
            normalizedOptions,
        );

        this.#addSubscription(subscription);
        return this.#createUnsubscribe(subscription);
    }

    /**
     * Cancels active delayed executions for an event.
     * @param {string} eventName
     * @param {string=} sender
     */
    cancelDelay(eventName, sender = DEFAULT_SENDER) {
        const subscriptions = this.#events.get(eventName) || [];

        subscriptions.forEach((subscription) => {
            this.#clearSubscriptionTimers(subscription);
        });

        logger.info(this.#formatEventAgentLog(`Event ${eventName} delays cancelled by ${sender}`));
    }

    /**
     * Registers a throttled event listener.
     * @param {string} eventName
     * @param {Function} listener
     * @param {number=} wait
     * @param {string|!Object=} options
     * @return {Function}
     */
    throttle(eventName, listener, wait = 300, options = {}) {
        const normalizedOptions = this.#normalizeOptions(options);
        let subscription;
        let lastTime = 0;

        const runner = (data) => {
            const now = Date.now();
            const remaining = wait - (now - lastTime);

            if (remaining <= 0) {
                this.#clearSubscriptionTimers(subscription);
                lastTime = now;
                listener(data);
                return;
            }

            if (subscription.timers.size > 0) {
                return;
            }

            const timerId = setTimeout(() => {
                subscription.timers.delete(timerId);
                lastTime = Date.now();
                listener(data);
            }, remaining);

            subscription.timers.add(timerId);
        };

        subscription = this.#createSubscription(
            eventName,
            listener,
            runner,
            normalizedOptions,
        );

        this.#addSubscription(subscription);
        return this.#createUnsubscribe(subscription);
    }

    /**
     * Registers a debounced event listener.
     * @param {string} eventName
     * @param {Function} listener
     * @param {number=} wait
     * @param {string|!Object=} options
     * @return {Function}
     */
    debounce(eventName, listener, wait = 300, options = {}) {
        const normalizedOptions = this.#normalizeOptions(options);
        let subscription;

        const runner = (data) => {
            this.#clearSubscriptionTimers(subscription);

            const timerId = setTimeout(() => {
                subscription.timers.delete(timerId);
                listener(data);
            }, wait);

            subscription.timers.add(timerId);
        };

        subscription = this.#createSubscription(
            eventName,
            listener,
            runner,
            normalizedOptions,
        );

        this.#addSubscription(subscription);
        return this.#createUnsubscribe(subscription);
    }

    /**
     * Removes all listeners for an event.
     * @param {string} eventName
     * @param {string=} sender
     */
    clear(eventName, sender = DEFAULT_SENDER) {
        const subscriptions = [...(this.#events.get(eventName) || [])];

        subscriptions.forEach((subscription) => {
            this.#removeSubscription(subscription, sender);
        });

        logger.info(this.#formatEventAgentLog(`Event ${eventName} cleared by ${sender}`));
    }

    /**
     * Removes all listeners registered under a scope.
     * @param {string} scope
     * @param {string=} sender
     */
    clearScope(scope, sender = DEFAULT_SENDER) {
        [...this.#events.values()].flat().forEach((subscription) => {
            if (subscription.scope === scope) {
                this.#removeSubscription(subscription, sender);
            }
        });

        logger.info(this.#formatEventAgentLog(`Scope ${scope} cleared by ${sender}`));
    }
}

export const EventAgent = new ClassEventAgent();
