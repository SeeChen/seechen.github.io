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
 * @fileoverview Reusable themed media-player controls and playback policy.
 */

import {
    SEECHEN_FMP4_VOD_PLAYER,
    SEECHEN_MEDIA_STATE_EVENT,
} from '../services/fmp4-vod-player.js';
import { SEECHEN_I18N } from '../services/i18n-service.js';
import { isNonEmptyString, isPlainObject } from '../util/type.js';

const I18N_NAMESPACE = 'MEDIA_PLAYER';
const SELECTOR = Object.freeze({
    ACTION: '[data-seechen-media-action]',
    CONTROLS: '[data-seechen-media-controls]',
    CURRENT_TIME: '[data-seechen-media-current-time]',
    DURATION: '[data-seechen-media-duration]',
    LOADING: '[data-seechen-media-loading]',
    LOADING_DOTS: '.seechen-media-player__loading-dots',
    PASSIVE_PROGRESS: '[data-seechen-media-passive-progress]',
    PREVIEW: '[data-seechen-media-preview]',
    PREVIEW_IMAGE: '[data-seechen-media-preview-image]',
    PREVIEW_TIME: '[data-seechen-media-preview-time]',
    PROGRESS: '[data-seechen-media-progress]',
    RATE: '[data-seechen-media-rate]',
    STATUS: '[data-seechen-media-status]',
    TIMELINE: '[data-seechen-media-timeline]',
    VIDEO: '[data-seechen-media-video]',
    VOLUME: '[data-seechen-media-volume]',
    VOLUME_CONTROL: '.seechen-media-player__volume-control',
    VOLUME_ICON: '[data-seechen-media-volume-icon]',
    VOLUME_PANEL: '.seechen-media-player__volume-panel',
    VOLUME_VALUE: '[data-seechen-media-volume-value]',
    WATERMARK: '[data-seechen-media-watermark]',
});

const PLAYBACK_STATE = Object.freeze({
    ERROR: 'error',
    IDLE: 'idle',
    LOADING: 'loading',
    READY: 'ready',
    UNSUPPORTED: 'unsupported',
});

const PLAYBACK_INTENT = Object.freeze({
    AUTO: 'auto',
    MANUAL_PAUSE: 'manual-pause',
    MANUAL_PLAY: 'manual-play',
});

const VOLUME_ICON = Object.freeze({
    HIGH: '🔊',
    LOW: '🔈',
    MEDIUM: '🔉',
    MUTED: '🔇',
});
const DOUBLE_TAP_MAX_DISTANCE_PX = 48;

const SEECHEN_MEDIA_PLAYER_STATE = new Map();

/** Keeps user intent authoritative over viewport-driven playback. */
class MediaPlayerState {
    /**
     * @param {!Object=} savedState Previously retained player state.
     */
    constructor(savedState = {}) {
        this.controlsVisible = true;
        this.intent = savedState.intent || PLAYBACK_INTENT.AUTO;
        this.isPictureInPicture = false;
        this.isPointerInside = false;
        this.isScrubbing = false;
        this.isTouchInteraction = false;
        this.isVisible = false;
        this.isVolumePanelOpen = false;
        this.pendingPlay = false;
    }

    /** Records an explicit user play request. */
    requestManualPlay() {
        this.intent = PLAYBACK_INTENT.MANUAL_PLAY;
        this.pendingPlay = true;
    }

    /** Records an explicit user pause until the user plays again. */
    requestManualPause() {
        this.intent = PLAYBACK_INTENT.MANUAL_PAUSE;
        this.pendingPlay = false;
    }

    /** Requests viewport-driven playback without erasing user intent. */
    requestAutoPlay() {
        if (this.intent !== PLAYBACK_INTENT.MANUAL_PAUSE) {
            this.pendingPlay = true;
        }
    }

    /** Cancels pending playback while retaining the current user intent. */
    cancelPendingPlay() {
        this.pendingPlay = false;
    }

    /** Returns whether automatic playback may currently resume. */
    canAutoPlay() {
        return this.intent !== PLAYBACK_INTENT.MANUAL_PAUSE;
    }
}

/**
 * Gets one required descendant.
 * @param {!Element} root
 * @param {string} selector
 * @return {!Element}
 */
function getRequiredElement(root, selector) {
    const element = root.querySelector(selector);

    if (!element) {
        throw new Error(`Media player requires selector: ${selector}`);
    }

    return element;
}

/**
 * Normalizes auto-play visibility thresholds.
 * @param {*} autoPlayConfig
 * @return {!Object}
 */
function normalizeAutoPlayConfig(autoPlayConfig) {
    if (
        !isPlainObject(autoPlayConfig) ||
        typeof autoPlayConfig.ENABLED !== 'boolean' ||
        typeof autoPlayConfig.MUTED !== 'boolean' ||
        !Number.isFinite(autoPlayConfig.START_RATIO) ||
        !Number.isFinite(autoPlayConfig.PAUSE_RATIO) ||
        autoPlayConfig.START_RATIO <= 0 ||
        autoPlayConfig.START_RATIO > 1 ||
        autoPlayConfig.PAUSE_RATIO < 0 ||
        autoPlayConfig.PAUSE_RATIO >= autoPlayConfig.START_RATIO
    ) {
        throw new TypeError('Invalid media-player auto-play configuration.');
    }

    return Object.freeze({
        enabled: autoPlayConfig.ENABLED,
        muted: autoPlayConfig.MUTED,
        pauseRatio: autoPlayConfig.PAUSE_RATIO,
        startRatio: autoPlayConfig.START_RATIO,
    });
}

/**
 * Normalizes custom-control interaction timing.
 * @param {*} controlsConfig
 * @return {!Object}
 */
function normalizeControlsConfig(controlsConfig) {
    if (
        !isPlainObject(controlsConfig) ||
        !Number.isFinite(controlsConfig.HIDE_DELAY_MS) ||
        !Number.isFinite(controlsConfig.DOUBLE_CLICK_DELAY_MS) ||
        !Number.isFinite(controlsConfig.VOLUME_PANEL_HIDE_DELAY_MS) ||
        controlsConfig.HIDE_DELAY_MS < 500 ||
        controlsConfig.DOUBLE_CLICK_DELAY_MS < 150 ||
        controlsConfig.VOLUME_PANEL_HIDE_DELAY_MS < 0 ||
        controlsConfig.VOLUME_PANEL_HIDE_DELAY_MS > 1000
    ) {
        throw new TypeError('Invalid media-player controls configuration.');
    }

    return Object.freeze({
        doubleClickDelay: controlsConfig.DOUBLE_CLICK_DELAY_MS,
        hideDelay: controlsConfig.HIDE_DELAY_MS,
        volumePanelHideDelay: controlsConfig.VOLUME_PANEL_HIDE_DELAY_MS,
    });
}

/**
 * Normalizes generated preview-frame metadata.
 * @param {*} previewConfig
 * @return {!Object}
 */
function normalizePreviewConfig(previewConfig) {
    if (
        !isPlainObject(previewConfig) ||
        typeof previewConfig.ENABLED !== 'boolean' ||
        !isNonEmptyString(previewConfig.DIRECTORY) ||
        !isNonEmptyString(previewConfig.EXTENSION) ||
        !Number.isFinite(previewConfig.INTERVAL_SECONDS) ||
        !Number.isInteger(previewConfig.COUNT) ||
        previewConfig.INTERVAL_SECONDS <= 0 ||
        previewConfig.COUNT <= 0
    ) {
        throw new TypeError('Invalid media-player preview configuration.');
    }

    return Object.freeze({
        count: previewConfig.COUNT,
        directory: previewConfig.DIRECTORY.replace(/\/$/, ''),
        enabled: previewConfig.ENABLED,
        extension: previewConfig.EXTENSION.replace(/^\./, ''),
        interval: previewConfig.INTERVAL_SECONDS,
    });
}

/**
 * Validates UI configuration while leaving transport fields untouched.
 * @param {*} config
 * @return {!Object}
 */
function normalizePlayerConfig(config) {
    if (
        !isPlainObject(config) ||
        !isNonEmptyString(config.WATERMARK) ||
        !isNonEmptyString(config.CONTROL_ARTWORK) ||
        !Array.isArray(config.PLAYBACK_RATES) ||
        config.PLAYBACK_RATES.length === 0 ||
        new Set(config.PLAYBACK_RATES).size !== config.PLAYBACK_RATES.length ||
        config.PLAYBACK_RATES.some((rate) => {
            return !Number.isFinite(rate) || rate <= 0 || rate > 4;
        }) ||
        (
            config.RESOLVE_VIDEO_LABEL !== undefined &&
            typeof config.RESOLVE_VIDEO_LABEL !== 'function'
        )
    ) {
        throw new TypeError(
            'Media player requires valid UI and playback fields.',
        );
    }

    return Object.freeze({
        autoPlay: normalizeAutoPlayConfig(config.AUTOPLAY),
        controls: normalizeControlsConfig(config.CONTROLS),
        controlArtwork: config.CONTROL_ARTWORK,
        playbackRates: Object.freeze([...config.PLAYBACK_RATES]),
        preview: normalizePreviewConfig(config.PREVIEW),
        resolveVideoLabel: config.RESOLVE_VIDEO_LABEL || null,
        transport: config,
        watermark: config.WATERMARK,
    });
}

/**
 * Formats one media time without depending on locale punctuation.
 * @param {number} seconds
 * @return {string}
 */
function formatMediaTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return '00:00';
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    const clock = [minutes, remainingSeconds]
        .map((value) => String(value).padStart(2, '0'));

    if (hours > 0) {
        clock.unshift(String(hours).padStart(2, '0'));
    }

    return clock.join(':');
}

/**
 * Returns the furthest buffered point for progress feedback.
 * @param {!HTMLVideoElement} video
 * @return {number}
 */
function getBufferedEnd(video) {
    if (video.buffered.length === 0) {
        return 0;
    }

    return video.buffered.end(video.buffered.length - 1);
}

/**
 * Resolves one of four volume symbols.
 * @param {!HTMLVideoElement} video
 * @return {string}
 */
function getVolumeIcon(video) {
    if (video.muted || video.volume === 0) {
        return VOLUME_ICON.MUTED;
    }

    if (video.volume <= 0.33) {
        return VOLUME_ICON.LOW;
    }

    if (video.volume <= 0.66) {
        return VOLUME_ICON.MEDIUM;
    }

    return VOLUME_ICON.HIGH;
}

/**
 * Attaches one themed player to a registered Media Player component.
 * @param {!Element} root
 * @param {!Object} config
 * @param {{signal: (!AbortSignal|undefined)}=} options
 * @return {{detach: Function, refreshText: Function}}
 */
function attachPlayer(root, config, options = {}) {
    if (!(root instanceof HTMLElement)) {
        throw new TypeError('Media player requires an HTMLElement root.');
    }

    const playerConfig = normalizePlayerConfig(config);
    const lifecycleSignal = options.signal;
    const video = /** @type {!HTMLVideoElement} */ (
        getRequiredElement(root, SELECTOR.VIDEO)
    );
    const controls = getRequiredElement(root, SELECTOR.CONTROLS);
    const loading = getRequiredElement(root, SELECTOR.LOADING);
    const loadingDots = getRequiredElement(root, SELECTOR.LOADING_DOTS);
    const statusElement = getRequiredElement(root, SELECTOR.STATUS);
    const currentTimeElement = getRequiredElement(root, SELECTOR.CURRENT_TIME);
    const durationElement = getRequiredElement(root, SELECTOR.DURATION);
    const timeline = getRequiredElement(root, SELECTOR.TIMELINE);
    const progress = /** @type {!HTMLInputElement} */ (
        getRequiredElement(root, SELECTOR.PROGRESS)
    );
    const passiveProgress = /** @type {!HTMLElement} */ (
        getRequiredElement(root, SELECTOR.PASSIVE_PROGRESS)
    );
    const preview = /** @type {!HTMLElement} */ (
        getRequiredElement(root, SELECTOR.PREVIEW)
    );
    const previewImage = /** @type {!HTMLElement} */ (
        getRequiredElement(root, SELECTOR.PREVIEW_IMAGE)
    );
    const previewTime = getRequiredElement(root, SELECTOR.PREVIEW_TIME);
    const rate = /** @type {!HTMLSelectElement} */ (
        getRequiredElement(root, SELECTOR.RATE)
    );
    const volume = /** @type {!HTMLInputElement} */ (
        getRequiredElement(root, SELECTOR.VOLUME)
    );
    const volumeControl = getRequiredElement(root, SELECTOR.VOLUME_CONTROL);
    const volumeActionControl = getRequiredElement(
        volumeControl,
        SELECTOR.ACTION,
    );
    const volumeIcon = getRequiredElement(root, SELECTOR.VOLUME_ICON);
    const volumePanel = getRequiredElement(root, SELECTOR.VOLUME_PANEL);
    const volumeValue = getRequiredElement(root, SELECTOR.VOLUME_VALUE);
    const watermark = /** @type {!HTMLElement} */ (
        getRequiredElement(root, SELECTOR.WATERMARK)
    );
    const actionControls = [...root.querySelectorAll(SELECTOR.ACTION)];
    const savedState = SEECHEN_MEDIA_PLAYER_STATE.get(config.PLAYLIST) || {};
    const state = new MediaPlayerState(savedState);
    const autoPlay = playerConfig.autoPlay;
    let currentState = PLAYBACK_STATE.IDLE;
    let controlsTimeoutId = null;
    let volumePanelTimeoutId = null;
    let videoClickTimeoutId = null;
    let videoClickPosition = null;
    let transportCleanup = null;
    let visibilityObserver = null;
    let previousVolume = 1;
    let hasPointerAdjustedVolume = false;
    let isDetached = false;

    /** Returns whether the active pointer uses touch-like interaction. */
    function usesTouchInteraction() {
        return state.isTouchInteraction;
    }

    /** Records the input mode before click and focus events are dispatched. */
    function handleRootPointerDown(event) {
        state.isTouchInteraction = event.pointerType === 'touch' ||
            event.pointerType === 'pen';
        root.classList.toggle(
            'uses-touch-controls',
            state.isTouchInteraction,
        );
        refreshText();
    }

    /** Resolves one configured player label in the current language. */
    function resolveText(name) {
        if (name === 'video_label' && playerConfig.resolveVideoLabel) {
            const videoLabel = playerConfig.resolveVideoLabel();

            if (isNonEmptyString(videoLabel)) {
                return videoLabel;
            }
        }

        return SEECHEN_I18N.t(I18N_NAMESPACE, name.toUpperCase());
    }

    /** Synchronizes accessible labels with current player state. */
    function refreshText() {
        const toggleLabel = resolveText(
            video.ended ? 'replay' : (video.paused ? 'play' : 'pause'),
        );
        const muteLabel = usesTouchInteraction() ?
            resolveText('volume') :
            resolveText(video.muted ? 'unmute' : 'mute');
        const fullscreenLabel = resolveText(
            document.fullscreenElement === root ?
                'exit_fullscreen' : 'fullscreen',
        );
        const pictureInPictureLabel = resolveText(
            document.pictureInPictureElement === video ?
                'exit_picture_in_picture' : 'picture_in_picture',
        );

        video.setAttribute('aria-label', resolveText('video_label'));
        progress.setAttribute('aria-label', resolveText('seek'));
        volume.setAttribute('aria-label', resolveText('volume'));
        rate.setAttribute('aria-label', resolveText('playback_rate'));
        actionControls.forEach((control) => {
            const action = control.dataset.seechenMediaAction;

            if (action === 'toggle') {
                control.setAttribute('aria-label', toggleLabel);
            } else if (action === 'mute') {
                control.setAttribute('aria-label', muteLabel);
            } else if (action === 'fullscreen') {
                control.setAttribute('aria-label', fullscreenLabel);
            } else if (action === 'picture-in-picture') {
                control.setAttribute('aria-label', pictureInPictureLabel);
            }
        });

        if (!loading.hidden) {
            statusElement.textContent = resolveText(currentState);
        }
    }

    /** Reflects transport state through the reusable Loading component. */
    function applyTransportState(nextState) {
        const isLoading = nextState === PLAYBACK_STATE.LOADING;
        const isTerminal = nextState === PLAYBACK_STATE.ERROR ||
            nextState === PLAYBACK_STATE.UNSUPPORTED;

        currentState = nextState;
        root.dataset.seechenMediaState = nextState;
        root.classList.toggle('has-media-error', isTerminal);
        loading.hidden = !isLoading && !isTerminal;
        loadingDots.hidden = isTerminal;

        if (!loading.hidden) {
            statusElement.textContent = resolveText(nextState);
        }

        actionControls.forEach((control) => {
            control.disabled = isTerminal;
        });
        progress.disabled = isTerminal;
        rate.disabled = isTerminal;
        volume.disabled = isTerminal;
    }

    /** Clears the pending control-hide operation. */
    function clearControlsTimeout() {
        if (controlsTimeoutId !== null) {
            window.clearTimeout(controlsTimeoutId);
            controlsTimeoutId = null;
        }
    }

    /** Clears the pending volume-panel close operation. */
    function clearVolumePanelTimeout() {
        if (volumePanelTimeoutId !== null) {
            window.clearTimeout(volumePanelTimeoutId);
            volumePanelTimeoutId = null;
        }
    }

    /** Hides interactive controls while retaining a passive progress line. */
    function hideControls(force = false) {
        if (
            state.isScrubbing ||
            state.isVolumePanelOpen ||
            (!force && controls.contains(document.activeElement))
        ) {
            return;
        }

        if (
            force &&
            controls.contains(document.activeElement) &&
            document.activeElement instanceof HTMLElement
        ) {
            document.activeElement.blur();
        }

        state.controlsVisible = false;
        root.classList.remove('are-controls-visible');
    }

    /** Schedules inactivity hiding only during active playback. */
    function scheduleControlsHide() {
        clearControlsTimeout();

        if (
            video.paused ||
            state.isScrubbing ||
            state.isVolumePanelOpen
        ) {
            return;
        }

        controlsTimeoutId = window.setTimeout(
            hideControls,
            playerConfig.controls.hideDelay,
        );
    }

    /** Reveals controls for current pointer or keyboard interaction. */
    function revealControls() {
        state.controlsVisible = true;
        root.classList.add('are-controls-visible');
        scheduleControlsHide();
    }

    /** Opens the volume panel and keeps the player controls available. */
    function showVolumePanel() {
        clearVolumePanelTimeout();
        state.isVolumePanelOpen = true;
        volumeControl.classList.add('is-volume-panel-open');
        volumeActionControl.setAttribute('aria-expanded', 'true');
        revealControls();
        clearControlsTimeout();
    }

    /** Closes the volume panel after pointer or focus interaction ends. */
    function hideVolumePanel(blurPointerFocus = false) {
        clearVolumePanelTimeout();
        state.isVolumePanelOpen = false;
        volumeControl.classList.remove('is-volume-panel-open');
        volumeActionControl.setAttribute('aria-expanded', 'false');

        if (
            blurPointerFocus &&
            hasPointerAdjustedVolume &&
            volumeControl.contains(document.activeElement) &&
            document.activeElement instanceof HTMLElement
        ) {
            document.activeElement.blur();
        }

        hasPointerAdjustedVolume = false;
        scheduleControlsHide();
    }

    /** Grants the pointer time to cross the triangular safe zone. */
    function scheduleVolumePanelHide() {
        if (!state.isVolumePanelOpen) {
            return;
        }

        clearVolumePanelTimeout();
        volumePanelTimeoutId = window.setTimeout(() => {
            volumePanelTimeoutId = null;
            hideVolumePanel(true);
        }, playerConfig.controls.volumePanelHideDelay);
    }

    /** Opens the volume panel when a pointing device enters its trigger. */
    function handleVolumePointerEnter(event) {
        if (event.pointerType === 'mouse') {
            showVolumePanel();
        }
    }

    /** Records pointer-originated focus so it can be released on exit. */
    function handleVolumePointerDown(event) {
        hasPointerAdjustedVolume = true;

        if (event.pointerType === 'mouse') {
            showVolumePanel();
        }
    }

    /** Closes after leaving the safe region; touch has no hover lifecycle. */
    function handleVolumePointerLeave(event) {
        if (event.pointerType === 'mouse') {
            scheduleVolumePanelHide();
        }
    }

    /** Keeps the panel available while keyboard focus remains inside it. */
    function handleVolumeFocusIn(event) {
        if (
            event.target instanceof Element &&
            event.target.matches(':focus-visible')
        ) {
            showVolumePanel();
        }
    }

    /** Closes after keyboard focus leaves both trigger and panel. */
    function handleVolumeFocusOut(event) {
        if (usesTouchInteraction()) {
            return;
        }

        if (
            event.relatedTarget instanceof Node &&
            volumeControl.contains(event.relatedTarget)
        ) {
            return;
        }

        if (!volumeControl.matches(':hover')) {
            scheduleVolumePanelHide();
        }
    }

    /** Dismisses a touch-opened panel when interaction moves elsewhere. */
    function handleDocumentPointerDown(event) {
        if (
            state.isVolumePanelOpen &&
            event.target instanceof Node &&
            !volumeControl.contains(event.target)
        ) {
            hideVolumePanel(true);
        }
    }

    /** Updates play, pause, mute, fullscreen, and PiP visual state. */
    function refreshControlState() {
        const isPlaying = !video.paused && !video.ended;
        const isMuted = video.muted || video.volume === 0;
        const isFullscreen = document.fullscreenElement === root;
        const isPictureInPicture = document.pictureInPictureElement === video;
        const displayedVolume = isMuted ? 0 : video.volume;

        state.isPictureInPicture = isPictureInPicture;
        root.classList.toggle('is-playing', isPlaying);
        root.classList.toggle('is-ended', video.ended);
        root.classList.toggle('is-muted', isMuted);
        root.classList.toggle('is-fullscreen', isFullscreen);
        root.classList.toggle('is-picture-in-picture', isPictureInPicture);
        volume.value = String(displayedVolume);
        volumeValue.textContent = String(Math.round(displayedVolume * 100));
        volumeIcon.textContent = getVolumeIcon(video);
        volume.style.setProperty(
            '--seechen-media-volume',
            `${displayedVolume * 100}%`,
        );
        refreshText();

        if (isPlaying) {
            scheduleControlsHide();
        } else {
            clearControlsTimeout();
            revealControls();
        }
    }

    /** Updates time, loaded range, and both progress representations. */
    function refreshTimeline() {
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const playedPercentage = duration > 0 ?
            video.currentTime / duration * 100 : 0;
        const bufferedPercentage = duration > 0 ?
            Math.min(100, getBufferedEnd(video) / duration * 100) : 0;
        const bufferedEnd = Math.max(playedPercentage, bufferedPercentage);

        progress.max = String(duration || 1);
        progress.value = String(Math.min(video.currentTime, duration || 0));
        progress.style.setProperty(
            '--seechen-media-progress',
            `${playedPercentage}%`,
        );
        progress.style.setProperty(
            '--seechen-media-buffered',
            `${bufferedEnd}%`,
        );
        passiveProgress.style.setProperty(
            '--seechen-media-progress',
            `${playedPercentage}%`,
        );
        currentTimeElement.textContent = formatMediaTime(video.currentTime);
        durationElement.textContent = formatMediaTime(duration);
    }

    /** Attempts playback while respecting asynchronous browser policies. */
    async function play(isManual = false) {
        if (isManual) {
            state.requestManualPlay();
        } else {
            state.requestAutoPlay();
        }

        if (!state.pendingPlay) {
            return;
        }

        try {
            await video.play();
            state.cancelPendingPlay();
        } catch (error) {
            if (error?.name === 'AbortError') {
                return;
            }

            if (error?.name === 'NotAllowedError') {
                state.cancelPendingPlay();
            }
        }
    }

    /** Applies an explicit user play/pause command. */
    function togglePlayback() {
        if (video.paused || video.ended) {
            if (video.ended) {
                video.currentTime = 0;
            }

            void play(true);
            return;
        }

        state.requestManualPause();
        video.pause();
    }

    /** Toggles muted playback while retaining the previous volume. */
    function toggleMute() {
        if (video.muted || video.volume === 0) {
            video.muted = false;
            video.volume = previousVolume || 1;
        } else {
            previousVolume = video.volume;
            video.muted = true;
        }

        refreshControlState();
    }

    /** Enters or exits the standard Fullscreen API surface. */
    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement === root) {
                await document.exitFullscreen();
            } else if (typeof root.requestFullscreen === 'function') {
                await root.requestFullscreen();
            } else if (typeof video.webkitEnterFullscreen === 'function') {
                video.webkitEnterFullscreen();
            }
        } catch {
            // The control remains usable when a browser denies fullscreen.
        }
    }

    /** Enters or exits browser Picture-in-Picture playback. */
    async function togglePictureInPicture() {
        if (!document.pictureInPictureEnabled) {
            return;
        }

        try {
            if (document.pictureInPictureElement === video) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        } catch {
            // Browsers may reject PiP before metadata is available.
        }
    }

    /** Handles all configured command controls through one listener. */
    function handleClick(event) {
        if (!(event.target instanceof Element)) {
            return;
        }

        const actionControl = event.target.closest(SELECTOR.ACTION);

        if (!actionControl || !root.contains(actionControl)) {
            return;
        }

        const action = actionControl.dataset.seechenMediaAction;

        revealControls();

        if (action === 'toggle') {
            togglePlayback();
        } else if (action === 'mute') {
            if (usesTouchInteraction() && event.detail !== 0) {
                if (state.isVolumePanelOpen) {
                    hideVolumePanel(true);
                } else {
                    showVolumePanel();
                }
            } else {
                toggleMute();
            }
        } else if (action === 'fullscreen') {
            void toggleFullscreen();
        } else if (action === 'picture-in-picture') {
            void togglePictureInPicture();
        }
    }

    /** Resolves one generated preview-frame URL. */
    function getPreviewUrl(time) {
        const previewConfig = playerConfig.preview;
        const frameIndex = Math.min(
            previewConfig.count - 1,
            Math.max(0, Math.floor(time / previewConfig.interval)),
        );
        const fileName = String(frameIndex).padStart(3, '0');
        return `${previewConfig.directory}/${fileName}.${previewConfig.extension}`;
    }

    /** Shows one timeline preview at a pointer-relative position. */
    function showPreview(clientX) {
        if (!playerConfig.preview.enabled || !Number.isFinite(video.duration)) {
            return;
        }

        const bounds = timeline.getBoundingClientRect();
        const relativeX = Math.min(
            bounds.width,
            Math.max(0, clientX - bounds.left),
        );
        const previewPosition = bounds.width > 0 ?
            relativeX / bounds.width : 0;
        const previewSeconds = previewPosition * video.duration;
        preview.hidden = false;
        const previewHalfWidth = preview.offsetWidth / 2;
        const previewLeft = Math.min(
            bounds.width - previewHalfWidth,
            Math.max(previewHalfWidth, relativeX),
        );

        preview.style.left = `${previewLeft}px`;
        previewImage.style.backgroundImage =
            `url("${getPreviewUrl(previewSeconds)}")`;
        previewTime.textContent = formatMediaTime(previewSeconds);
    }

    /** Hides the timeline preview outside a drag gesture. */
    function hidePreview() {
        if (!state.isScrubbing) {
            preview.hidden = true;
        }
    }

    /** Tracks timeline hover and drag previews. */
    function handleTimelinePointerMove(event) {
        showPreview(event.clientX);
        revealControls();
    }

    /** Starts a seek gesture without letting inactivity hide controls. */
    function handleProgressPointerDown(event) {
        state.isScrubbing = true;
        clearControlsTimeout();
        showPreview(event.clientX);
    }

    /** Finishes a seek gesture and restores inactivity behavior. */
    function handleProgressPointerUp() {
        state.isScrubbing = false;
        preview.hidden = true;
        scheduleControlsHide();
    }

    /** Seeks to the position selected through the custom timeline. */
    function handleProgressInput() {
        const nextTime = Number(progress.value);

        if (Number.isFinite(nextTime)) {
            video.currentTime = nextTime;
            refreshTimeline();
        }
    }

    /** Applies the custom volume slider without using native controls. */
    function handleVolumeInput() {
        const nextVolume = Number(volume.value);

        if (!Number.isFinite(nextVolume)) {
            return;
        }

        showVolumePanel();
        video.volume = nextVolume;
        video.muted = nextVolume === 0;

        if (nextVolume > 0) {
            previousVolume = nextVolume;
        }

        refreshControlState();
    }

    /** Applies one configured playback speed. */
    function handleRateChange() {
        const nextRate = Number(rate.value);

        if (playerConfig.playbackRates.includes(nextRate)) {
            video.playbackRate = nextRate;
        }
    }

    /** Supports focused keyboard playback without stealing form input keys. */
    function handleKeydown(event) {
        if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLSelectElement
        ) {
            return;
        }

        revealControls();

        if (event.key === ' ' || event.key.toLowerCase() === 'k') {
            event.preventDefault();
            togglePlayback();
        } else if (event.key.toLowerCase() === 'm') {
            event.preventDefault();
            toggleMute();
        } else if (event.key.toLowerCase() === 'f') {
            event.preventDefault();
            void toggleFullscreen();
        } else if (event.key.toLowerCase() === 'i') {
            event.preventDefault();
            void togglePictureInPicture();
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const offset = event.key === 'ArrowRight' ? 5 : -5;
            video.currentTime = Math.max(
                0,
                Math.min(video.duration || 0, video.currentTime + offset),
            );
        }
    }

    /** Applies the single-tap control visibility command. */
    function toggleControlsVisibility() {
        if (state.controlsVisible) {
            hideVolumePanel(true);
            hideControls(true);
        } else {
            revealControls();
        }
    }

    /** Distinguishes a nearby second tap without relying on dblclick support. */
    function isNearbyVideoClick(event, isTouchInteraction) {
        if (!videoClickPosition) {
            return false;
        }

        return videoClickPosition.isTouchInteraction === isTouchInteraction &&
            Math.hypot(
                event.clientX - videoClickPosition.x,
                event.clientY - videoClickPosition.y,
            ) <= DOUBLE_TAP_MAX_DISTANCE_PX;
    }

    /** Applies one video click according to its originating input mode. */
    function applySingleVideoClick(isTouchInteraction) {
        if (isTouchInteraction) {
            toggleControlsVisibility();
        } else {
            togglePlayback();
        }
    }

    /** Applies one video double click according to its input mode. */
    function applyDoubleVideoClick(isTouchInteraction) {
        if (isTouchInteraction) {
            togglePlayback();
        } else {
            void toggleFullscreen();
        }
    }

    /** Defers a control toggle while waiting for a possible second tap. */
    function handleVideoClick(event) {
        const isTouchInteraction = usesTouchInteraction();

        if (videoClickTimeoutId !== null) {
            const previousClickUsedTouch =
                videoClickPosition?.isTouchInteraction || false;
            window.clearTimeout(videoClickTimeoutId);
            videoClickTimeoutId = null;

            if (isNearbyVideoClick(event, isTouchInteraction)) {
                videoClickPosition = null;
                applyDoubleVideoClick(isTouchInteraction);
                return;
            }

            applySingleVideoClick(previousClickUsedTouch);
        }

        videoClickPosition = {
            isTouchInteraction,
            x: event.clientX,
            y: event.clientY,
        };
        videoClickTimeoutId = window.setTimeout(() => {
            videoClickTimeoutId = null;
            videoClickPosition = null;
            applySingleVideoClick(isTouchInteraction);
        }, playerConfig.controls.doubleClickDelay);
    }

    /** Prevents native double-click behavior after custom detection runs. */
    function handleVideoDoubleClick(event) {
        event.preventDefault();
    }

    /** Reveals controls while the pointer is active over the video. */
    function handlePointerMove(event) {
        if (event.pointerType === 'touch' || event.pointerType === 'pen') {
            return;
        }

        state.isPointerInside = true;
        revealControls();
    }

    /** Immediately clears controls when leaving a non-fullscreen player. */
    function handlePointerLeave(event) {
        if (event.pointerType === 'touch' || event.pointerType === 'pen') {
            return;
        }

        state.isPointerInside = false;
        hideVolumePanel(true);

        if (document.fullscreenElement !== root) {
            clearControlsTimeout();
            hideControls();
        } else {
            scheduleControlsHide();
        }
    }

    /** Applies transport events to the themed loading surface. */
    function handleMediaState(event) {
        applyTransportState(event.detail?.state || PLAYBACK_STATE.IDLE);
    }

    /** Resumes a pending visible play request once media becomes playable. */
    function handleCanPlay() {
        if (state.pendingPlay && video.paused) {
            void play(state.intent === PLAYBACK_INTENT.MANUAL_PLAY);
        }
    }

    /** Restores the retained position after a remounted source is ready. */
    function restoreSavedPosition() {
        if (Number.isFinite(savedState.currentTime)) {
            video.currentTime = Math.min(
                savedState.currentTime,
                video.duration || savedState.currentTime,
            );
        }
    }

    /** Updates play state after media starts. */
    function handlePlay() {
        state.cancelPendingPlay();
        refreshControlState();
    }

    /** Prevents automatic replay after reaching the end. */
    function handleEnded() {
        state.requestManualPause();
        refreshControlState();
    }

    /** Keeps PiP state and viewport playback policy synchronized. */
    function handlePictureInPictureChange() {
        refreshControlState();

        if (!state.isPictureInPicture && !state.isVisible) {
            video.pause();
        }
    }

    /** Releases playback outside the configured viewport threshold. */
    function handleVisibility(entries) {
        const entry = entries[0];

        if (!entry || !autoPlay.enabled) {
            return;
        }

        if (entry.intersectionRatio >= autoPlay.startRatio) {
            state.isVisible = true;

            if (state.canAutoPlay() && !video.ended) {
                void play(false);
            }
            return;
        }

        if (entry.intersectionRatio <= autoPlay.pauseRatio) {
            state.isVisible = false;
            state.cancelPendingPlay();

            if (!state.isPictureInPicture) {
                video.pause();
            }
        }
    }

    /** Builds configured rate options and removes unsupported controls. */
    function applyRuntimeCapabilities() {
        const rateOptions = playerConfig.playbackRates.map((value) => {
            const option = document.createElement('option');
            option.value = String(value);
            option.textContent = `${value}\u00d7`;
            return option;
        });
        rate.replaceChildren(...rateOptions);
        rate.value = String(video.playbackRate);

        const pictureInPictureControl = root.querySelector(
            '[data-seechen-media-action="picture-in-picture"]',
        );

        if (
            pictureInPictureControl &&
            (!document.pictureInPictureEnabled ||
                typeof video.requestPictureInPicture !== 'function')
        ) {
            pictureInPictureControl.hidden = true;
        }
    }

    /** Releases media, observers, timers, and all component listeners. */
    function detach() {
        if (isDetached) {
            return;
        }

        isDetached = true;
        SEECHEN_MEDIA_PLAYER_STATE.set(config.PLAYLIST, Object.freeze({
            currentTime: video.currentTime,
            intent: state.intent,
            muted: video.muted,
            playbackRate: video.playbackRate,
            volume: video.volume,
        }));
        clearControlsTimeout();
        clearVolumePanelTimeout();

        if (videoClickTimeoutId !== null) {
            window.clearTimeout(videoClickTimeoutId);
            videoClickTimeoutId = null;
        }
        videoClickPosition = null;

        visibilityObserver?.disconnect();
        visibilityObserver = null;
        transportCleanup?.();
        transportCleanup = null;
        root.removeEventListener('click', handleClick);
        root.removeEventListener('keydown', handleKeydown);
        root.removeEventListener('pointerdown', handleRootPointerDown, true);
        root.removeEventListener('pointermove', handlePointerMove);
        root.removeEventListener('pointerleave', handlePointerLeave);
        timeline.removeEventListener('pointermove', handleTimelinePointerMove);
        timeline.removeEventListener('pointerleave', hidePreview);
        progress.removeEventListener('input', handleProgressInput);
        progress.removeEventListener('pointerdown', handleProgressPointerDown);
        progress.removeEventListener('pointerup', handleProgressPointerUp);
        progress.removeEventListener('pointercancel', handleProgressPointerUp);
        volume.removeEventListener('input', handleVolumeInput);
        volumeControl.removeEventListener(
            'pointerenter',
            handleVolumePointerEnter,
        );
        volumeControl.removeEventListener(
            'pointerleave',
            handleVolumePointerLeave,
        );
        volumeControl.removeEventListener(
            'pointerdown',
            handleVolumePointerDown,
        );
        volumeControl.removeEventListener('focusin', handleVolumeFocusIn);
        volumeControl.removeEventListener('focusout', handleVolumeFocusOut);
        volumePanel.removeEventListener('pointerenter', showVolumePanel);
        rate.removeEventListener('change', handleRateChange);
        video.removeEventListener(SEECHEN_MEDIA_STATE_EVENT, handleMediaState);
        video.removeEventListener('click', handleVideoClick);
        video.removeEventListener('dblclick', handleVideoDoubleClick);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', refreshControlState);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('volumechange', refreshControlState);
        video.removeEventListener('timeupdate', refreshTimeline);
        video.removeEventListener('progress', refreshTimeline);
        video.removeEventListener('durationchange', refreshTimeline);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('loadedmetadata', restoreSavedPosition);
        video.removeEventListener(
            'enterpictureinpicture',
            handlePictureInPictureChange,
        );
        video.removeEventListener(
            'leavepictureinpicture',
            handlePictureInPictureChange,
        );
        document.removeEventListener('fullscreenchange', refreshControlState);
        document.removeEventListener('pointerdown', handleDocumentPointerDown);
        lifecycleSignal?.removeEventListener('abort', detach);
    }

    video.controls = false;
    video.muted = typeof savedState.muted === 'boolean' ?
        savedState.muted : autoPlay.muted;
    video.volume = Number.isFinite(savedState.volume) ?
        savedState.volume : 1;
    const defaultPlaybackRate = playerConfig.playbackRates.includes(1) ?
        1 : playerConfig.playbackRates[0];
    video.playbackRate = playerConfig.playbackRates.includes(
        savedState.playbackRate,
    ) ? savedState.playbackRate : defaultPlaybackRate;
    video.poster = config.POSTER;
    watermark.style.backgroundImage = `url("${playerConfig.watermark}")`;
    root.style.setProperty(
        '--seechen-media-control-artwork',
        `url("${playerConfig.controlArtwork}")`,
    );
    applyRuntimeCapabilities();
    volumeActionControl.setAttribute('aria-haspopup', 'true');
    volumeActionControl.setAttribute('aria-expanded', 'false');
    root.classList.add('are-controls-visible');
    root.addEventListener('click', handleClick);
    root.addEventListener('keydown', handleKeydown);
    root.addEventListener('pointerdown', handleRootPointerDown, true);
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerleave', handlePointerLeave);
    timeline.addEventListener('pointermove', handleTimelinePointerMove);
    timeline.addEventListener('pointerleave', hidePreview);
    progress.addEventListener('input', handleProgressInput);
    progress.addEventListener('pointerdown', handleProgressPointerDown);
    progress.addEventListener('pointerup', handleProgressPointerUp);
    progress.addEventListener('pointercancel', handleProgressPointerUp);
    volume.addEventListener('input', handleVolumeInput);
    volumeControl.addEventListener('pointerenter', handleVolumePointerEnter);
    volumeControl.addEventListener('pointerleave', handleVolumePointerLeave);
    volumeControl.addEventListener('pointerdown', handleVolumePointerDown);
    volumeControl.addEventListener('focusin', handleVolumeFocusIn);
    volumeControl.addEventListener('focusout', handleVolumeFocusOut);
    volumePanel.addEventListener('pointerenter', showVolumePanel);
    rate.addEventListener('change', handleRateChange);
    video.addEventListener(SEECHEN_MEDIA_STATE_EVENT, handleMediaState);
    video.addEventListener('click', handleVideoClick);
    video.addEventListener('dblclick', handleVideoDoubleClick);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', refreshControlState);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', refreshControlState);
    video.addEventListener('timeupdate', refreshTimeline);
    video.addEventListener('progress', refreshTimeline);
    video.addEventListener('durationchange', refreshTimeline);
    video.addEventListener('loadedmetadata', restoreSavedPosition, {
        once: true,
        signal: lifecycleSignal,
    });
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener(
        'enterpictureinpicture',
        handlePictureInPictureChange,
    );
    video.addEventListener(
        'leavepictureinpicture',
        handlePictureInPictureChange,
    );
    document.addEventListener('fullscreenchange', refreshControlState);
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    lifecycleSignal?.addEventListener('abort', detach, { once: true });

    transportCleanup = SEECHEN_FMP4_VOD_PLAYER.attach(
        video,
        {
            ...playerConfig.transport,
            RESOLVE_TEXT: resolveText,
        },
        {
            signal: lifecycleSignal,
            statusElement,
        },
    );
    visibilityObserver = new IntersectionObserver(handleVisibility, {
        threshold: [autoPlay.pauseRatio, autoPlay.startRatio],
    });
    visibilityObserver.observe(root);
    refreshControlState();
    refreshTimeline();
    applyTransportState(PLAYBACK_STATE.IDLE);

    if (lifecycleSignal?.aborted) {
        detach();
    }

    return Object.freeze({
        detach,
        refreshText,
    });
}

export const SEECHEN_MEDIA_PLAYER = Object.freeze({
    attach: attachPlayer,
});
