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
 * @file src/js/core/eventAgent.js
 * @description Event Agent for managing event listeners and event emissions.
 * @author Lee See Chen
 * @date 2026-04-19
 */

import { logger } from "../util/logger.js";

class ClassEventAgent {

    /** @type {Map<string, Array<Function>>} */
    #events = new Map();

    /** @type {Map<string, Array<Function>>} */
    #timer = new Map();

    constructor() {
        logger.info("EventAgent Initialized");
    }

    #formatEventAgentLog(eventName) {
        return `[EVENT AGENT] ${eventName} | ${logger.level === 'debug' ? this.#getCallerInfo() : ''}`;
    }

    #getCallerInfo() {
        const err = new Error();
        const stack = err.stack.split("\n");
        // stack[0] Error Message
        // stack[1] #getCallerInfo
        // stack[2] emit function
        // stack[3] caller
        const callerLine = stack[3] || "";
        const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
            callerLine.match(/at\s+(.*):(\d+):(\d+)/);

        if (match) {
            return match[1] || match[2];
        }
        return "SeeChen";
    }

    /**
     * 
     * @param {string} eventName 
     * @param {Function} listener 
     * @param {string} sender 
     */
    on(eventName, listener, sender = "Unknown") {
        sender = sender;
        if (!this.#events.has(eventName)) {
            logger.debug(this.#formatEventAgentLog(`Event ${eventName} not found, initializing...`));
            this.#events.set(eventName, []);
        }

        this.#events.get(eventName).push(listener);
        logger.info(this.#formatEventAgentLog(`Event ${eventName} registered by ${sender}`));
    }

    /**
     * 
     * @param {string} eventName 
     * @param {Function} listener 
     * @param {string} sender 
     */
    off(eventName, listener, sender = "Unknown") {
        sender = sender;
        if (!this.#events.has(eventName)) {
            logger.debug(this.#formatEventAgentLog(`Event ${eventName} not found to remove.`));
            return;
        }
        this.#events.set(eventName, this.#events.get(eventName).filter(l => l !== listener));
        logger.info(this.#formatEventAgentLog(`Event ${eventName} listener removed by ${sender}`));
    }

    /**
     * 
     * @param {string} eventName 
     * @param {*} data 
     * @param {string} sender 
     */
    emit(eventName, data, sender = "Unknown") {
        sender = sender;
        const listeners = this.#events.get(eventName);
        if (!listeners) {
            logger.debug(this.#formatEventAgentLog(`Event ${eventName} not found, cannot emit.`));
            return;
        }

        [...listeners].forEach(listener => {
            try {
                logger.debug(this.#formatEventAgentLog(`Event ${eventName} emitted by ${sender}`));
                listener(data);
            } catch (error) {
                logger.error(this.#formatEventAgentLog(`Error in listener for event ${eventName}, ${error}`));
            }
        });
    }

    /**
     * Listen to an event exactly once, then remove the listener automatically.
     * @param {string} eventName 
     * @param {Function} listener 
     * @param {string} sender 
     */
    once(eventName, listener, sender = "Unknown") {
        sender = sender;
        logger.info(this.#formatEventAgentLog(`Event ${eventName} once configured by ${sender}`));
        const wrapper = (data) => {
            listener(data);
            this.off(eventName, wrapper, "EventAgent-Once-Wrapper");
        };
        this.on(eventName, wrapper, sender);
    }

    /**
     * Listen to an event but delay its execution by `wait` milliseconds.
     * @param {string} eventName 
     * @param {Function} listener 
     * @param {number} wait 
     * @param {string} sender 
     */
    delay(eventName, listener, wait = 1000, sender = "Unknown") {
        sender = sender;
        logger.info(this.#formatEventAgentLog(`Event ${eventName} delayed ${wait}ms by ${sender}`));
        const wrapper = (data) => {
            const timerId = setTimeout(() => {
                logger.debug(this.#formatEventAgentLog(`Event ${eventName} executed after delay`));
                listener(data);
            }, wait);

            if (!this.#timer.has(eventName)) this.#timer.set(eventName, []);
            this.#timer.get(eventName).push(timerId);
        };
        this.on(eventName, wrapper, sender);
    }

    /**
     * Cancel all active delayed/debounced executions for a specific event
     * @param {string} eventName 
     * @param {string} sender 
     */
    cancelDelay(eventName, sender = "Unknown") {
        sender = sender;
        logger.info(this.#formatEventAgentLog(`Event ${eventName} delays cancelled by ${sender}`));
        if (this.#timer.has(eventName)) {
            this.#timer.get(eventName).forEach(timerId => clearTimeout(timerId));
            this.#timer.delete(eventName);
        }
    }

    /**
     * Limit how often a listener can be called (executes at most once every `wait` ms)
     * @param {string} eventName 
     * @param {Function} listener 
     * @param {number} wait 
     * @param {string} sender 
     */
    throttle(eventName, listener, wait = 300, sender = "Unknown") {
        sender = sender;
        logger.info(this.#formatEventAgentLog(`Event ${eventName} throttle ${wait}ms configured by ${sender}`));
        let timer = null;
        let lastTime = 0;
        const wrapper = (data) => {
            const now = Date.now();
            if (now - lastTime >= wait) {
                if (timer) clearTimeout(timer);
                lastTime = now;
                listener(data);
            } else {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    lastTime = Date.now();
                    listener(data);
                }, wait);
            }
        };
        this.on(eventName, wrapper, sender);
    }

    /**
     * Delay execution until it has been `wait` ms since the last event emit
     * Useful for Search Bars, Window Resizing, etc.
     * @param {string} eventName 
     * @param {Function} listener 
     * @param {number} wait 
     * @param {string} sender 
     */
    debounce(eventName, listener, wait = 300, sender = "Unknown") {
        sender = sender;
        logger.info(this.#formatEventAgentLog(`Event ${eventName} debounce ${wait}ms configured by ${sender}`));
        const wrapper = (data) => {
            this.cancelDelay(eventName, "EventAgent-Debounce-Wrapper");

            const timerId = setTimeout(() => {
                logger.debug(this.#formatEventAgentLog(`Event ${eventName} executed after debounce`));
                listener(data);
                this.#timer.delete(eventName);
            }, wait);

            if (!this.#timer.has(eventName)) this.#timer.set(eventName, []);
            this.#timer.get(eventName).push(timerId);
        };
        this.on(eventName, wrapper, sender);
    }

    /**
     * Remove entirely all listeners and clear timers for a specific event
     * @param {string} eventName 
     * @param {string} sender
     */
    clear(eventName, sender = "Unknown") {
        sender = sender;
        logger.info(this.#formatEventAgentLog(`Event ${eventName} cleared entirely by ${sender}`));
        this.#events.delete(eventName);
        this.cancelDelay(eventName, sender);
    }

}

export const EventAgent = new ClassEventAgent();
