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
 * @fileoverview Home page lifecycle for SeeChen Website.
 */

import { SEECHEN_MEDIA_PLAYER } from '../components/media-player.js';
import { vDom } from '../core/vDom.js';
import { SEECHEN_I18N } from '../services/i18n-service.js';
import {
    SEECHEN_RESPONSIVE,
    SEECHEN_VIEWPORT,
} from '../services/responsive.js';
import { SEECHEN_RESOURCE } from '../services/resource.js';
import { SEECHEN_SECTION_SCROLLER } from '../services/section-scroller.js';
import {
    findSeeChenLayoutSlot,
    setSeeChenLayoutSlotChildren,
} from '../util/layout.js';
import {
    freezeSeeChenObject,
    isNonEmptyString,
    isPlainObject,
} from '../util/type.js';

const HOME_SELECTOR          = '[data-seechen-page="home"]';
const HOME_NAMESPACE         = 'HOME';
const SCROLL_TARGET_SELECTOR = '[data-seechen-scroll-target]';
const WORK_PROJECT_SLOT      = 'work-projects';

const TRAVEL_HIGHLIGHT_SLOT     = 'travel-highlights';
const TRAVEL_CONTROLS_SLOT      = 'travel-controls';
const TRAVEL_NAMESPACE          = 'TRAVEL';
const TRAVEL_CAROUSEL_SELECTOR  = '[data-seechen-travel-carousel]';
const TRAVEL_TRACK_SELECTOR     = '[data-seechen-travel-track]';
const TRAVEL_CARD_SELECTOR      = '[data-seechen-travel-highlight]';
const TRAVEL_CONTROL_SELECTOR   = '.seechen-home__travel-dot[data-seechen-travel-index]';
const TRAVEL_DIRECTION_SELECTOR = '[data-seechen-travel-direction]';

const CURRENT_STATE_SLOT = 'current-state';
const CHRONICLE_VIDEO_LABEL_KEY = 'CHRONICLE_VIDEO_LABEL';
const CHRONICLE_PLAYER_SELECTOR = '#seechenHomeChronicle [data-seechen-media-player]';
const CONTENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const WORK_PROJECT_TEXT_KEY_FIELDS = Object.freeze([
    'CATEGORY_KEY',
    'TITLE_KEY',
    'DESCRIPTION_KEY',
    'LINK_TEXT_KEY',
]);
const TRAVEL_TEXT_KEY_FIELDS = Object.freeze([
    'LOCATION_KEY',
    'TITLE_KEY',
    'DESCRIPTION_KEY',
    'ALT_KEY',
    'LINK_TEXT_KEY',
]);
const CURRENT_STATE_TEXT_KEY_FIELDS = Object.freeze([
    'LABEL_KEY',
    'TITLE_KEY',
    'META_KEY',
    'DESCRIPTION_KEY',
    'ALT_KEY',
]);
const CURRENT_STATE_ICONS = Object.freeze([
    'FOCUS',
    'BUILD',
    'LOCATION',
    'JOURNEY',
    'LENS',
    'TRAVEL',
    'STUDY',
    'FOOD',
]);
const CURRENT_STATE_VARIANTS = Object.freeze([
    'COMPACT',
    'STANDARD',
]);
const VIEWPORT_NAMES = Object.freeze(Object.values(SEECHEN_VIEWPORT));
const TRAVEL_DISPLAY_MODES = Object.freeze([
    SEECHEN_VIEWPORT.MOBILE,
    SEECHEN_VIEWPORT.DESKTOP,
]);
const TRAVEL_HORIZONTAL_POSITIONS = Object.freeze([
    'LEFT',
    'CENTER',
    'RIGHT',
]);
const TRAVEL_VERTICAL_POSITIONS = Object.freeze([
    'TOP',
    'CENTER',
    'BOTTOM',
]);
const EXTERNAL_LINK_PATTERN = /^https?:/i;

let scrollCleanup = null;
let responsiveCleanup = null;
let travelCarouselCleanup = null;
let chronicleController = null;
let activeLayout = null;
let activeState = null;
let activeLifecycleContext = null;

/**
 * Validates and freezes named viewport limits.
 * @param {*} limits
 * @param {string} label
 * @return {!Object}
 */
function normalizeViewportLimits(limits, label) {
    if (
        !isPlainObject(limits) ||
        VIEWPORT_NAMES.some((name) => {
            return !Number.isInteger(limits[name]) || limits[name] < 0;
        })
    ) {
        throw new TypeError(
            `${label} requires non-negative viewport limits.`,
        );
    }

    return freezeSeeChenObject(limits);
}

/**
 * Checks whether an item declares every required translation key.
 * @param {!Object} item
 * @param {!Array<string>} fields
 * @return {boolean}
 */
function hasTextKeys(item, fields) {
    return fields.every((field) => {
        return isNonEmptyString(item[field]);
    });
}

/**
 * Validates and normalizes the configurable Work project data.
 * @param {*} projectConfig
 * @return {!Object}
 */
function normalizeWorkProjectConfig(projectConfig) {
    if (!isPlainObject(projectConfig) || !Array.isArray(projectConfig.ITEMS)) {
        throw new TypeError('Home Work projects require an ITEMS array.');
    }

    const maxVisible = normalizeViewportLimits(
        projectConfig.MAX_VISIBLE,
        'Home Work MAX_VISIBLE',
    );

    projectConfig.ITEMS.forEach((item) => {
        if (
            !isPlainObject(item) ||
            !isNonEmptyString(item.ID) ||
            !hasTextKeys(
                item,
                WORK_PROJECT_TEXT_KEY_FIELDS,
            ) ||
            !isNonEmptyString(item.HREF) ||
            (item.WEIGHT !== undefined && !Number.isFinite(item.WEIGHT)) ||
            (item.ENABLED !== undefined && typeof item.ENABLED !== 'boolean')
        ) {
            throw new TypeError(
                'Each Home Work project requires valid content, link, and weight fields.',
            );
        }
    });

    const enabledItems = projectConfig.ITEMS
        .filter((item) => item.ENABLED !== false)
        .sort((first, second) => {
            return (second.WEIGHT || 0) - (first.WEIGHT || 0);
        });

    return freezeSeeChenObject({
        MAX_VISIBLE: maxVisible,
        ITEMS: enabledItems,
    });
}

/**
 * Checks one constrained image focal position.
 * @param {*} position
 * @return {boolean}
 */
function isTravelImagePosition(position) {
    return isPlainObject(position) &&
        Object.keys(position).length === 2 &&
        TRAVEL_HORIZONTAL_POSITIONS.includes(position.HORIZONTAL) &&
        TRAVEL_VERTICAL_POSITIONS.includes(position.VERTICAL);
}

/**
 * Checks image focal positions for both Travel display modes.
 * @param {*} imagePosition
 * @return {boolean}
 */
function hasTravelImagePositions(imagePosition) {
    return isPlainObject(imagePosition) &&
        Object.keys(imagePosition).length === TRAVEL_DISPLAY_MODES.length &&
        TRAVEL_DISPLAY_MODES.every((displayMode) => {
            return isTravelImagePosition(imagePosition[displayMode]);
        });
}

/**
 * Resolves the two-mode Travel configuration for a named viewport.
 * @param {string} viewport
 * @return {string}
 */
function getTravelDisplayMode(viewport) {
    return viewport === SEECHEN_VIEWPORT.MOBILE ?
        SEECHEN_VIEWPORT.MOBILE :
        SEECHEN_VIEWPORT.DESKTOP;
}

/**
 * Validates and orders configurable Home Travel highlights.
 * @param {*} highlightConfig
 * @return {!Object}
 */
function normalizeTravelHighlightConfig(highlightConfig) {
    if (!isPlainObject(highlightConfig) ||
        !Array.isArray(highlightConfig.ITEMS)) {
        throw new TypeError('Home Travel highlights require an ITEMS array.');
    }

    const maxVisible = normalizeViewportLimits(
        highlightConfig.MAX_VISIBLE,
        'Home Travel MAX_VISIBLE',
    );
    const highlightIds = new Set();

    highlightConfig.ITEMS.forEach((item, index) => {
        const fieldChecks = [
            ['item', isPlainObject(item)],
            ['ID', isPlainObject(item) &&
                isNonEmptyString(item.ID) &&
                CONTENT_ID_PATTERN.test(item.ID)],
            ['IMAGE', isPlainObject(item) &&
                isNonEmptyString(item.IMAGE)],
            ['IMAGE_POSITION', isPlainObject(item) &&
                hasTravelImagePositions(item.IMAGE_POSITION)],
            ['translation keys', isPlainObject(item) &&
                hasTextKeys(item, TRAVEL_TEXT_KEY_FIELDS)],
            ['HREF', isPlainObject(item) &&
                isNonEmptyString(item.HREF)],
            ['ORDER', isPlainObject(item) &&
                Number.isFinite(item.ORDER)],
            ['ENABLED', isPlainObject(item) &&
                isPlainObject(item.ENABLED) &&
                typeof item.ENABLED.MOBILE === 'boolean' &&
                typeof item.ENABLED.DESKTOP === 'boolean'],
        ];
        const invalidField = fieldChecks.find(([, isValid]) => !isValid);

        if (invalidField) {
            const itemLabel = isPlainObject(item) &&
                isNonEmptyString(item.ID) ?
                `"${item.ID}"` :
                `at index ${index}`;
            throw new TypeError(
                `Home Travel highlight ${itemLabel} has an invalid ` +
                `${invalidField[0]} field.`,
            );
        }

        if (highlightIds.has(item.ID)) {
            throw new TypeError(
                `Home Travel highlight ID must be unique: ${item.ID}`,
            );
        }

        highlightIds.add(item.ID);
    });

    const orderedItems = [...highlightConfig.ITEMS]
        .sort((first, second) => first.ORDER - second.ORDER);

    return freezeSeeChenObject({
        MAX_VISIBLE: maxVisible,
        ITEMS: orderedItems,
    });
}

/**
 * Requires a Chronicle config object; the Media Player owns its contract.
 * @param {*} chronicleConfig
 * @return {!Object}
 */
function requireYearChronicleConfig(chronicleConfig) {
    if (!isPlainObject(chronicleConfig)) {
        throw new TypeError('Home year chronicle requires a config object.');
    }

    return freezeSeeChenObject(chronicleConfig);
}

/**
 * Validates and orders configurable Home Current State content.
 * @param {*} currentStateConfig
 * @return {!Object}
 */
function normalizeCurrentStateConfig(currentStateConfig) {
    if (
        !isPlainObject(currentStateConfig) ||
        !Array.isArray(currentStateConfig.ITEMS)
    ) {
        throw new TypeError('Home Current State requires an ITEMS array.');
    }

    const maxVisible = normalizeViewportLimits(
        currentStateConfig.MAX_VISIBLE,
        'Home Current State MAX_VISIBLE',
    );
    const itemIds = new Set();

    currentStateConfig.ITEMS.forEach((item) => {
        if (
            !isPlainObject(item) ||
            !isNonEmptyString(item.ID) ||
            !CONTENT_ID_PATTERN.test(item.ID) ||
            !CURRENT_STATE_ICONS.includes(item.ICON) ||
            !CURRENT_STATE_VARIANTS.includes(item.VARIANT) ||
            !isNonEmptyString(item.IMAGE) ||
            !hasTextKeys(
                item,
                CURRENT_STATE_TEXT_KEY_FIELDS,
            ) ||
            !Number.isFinite(item.ORDER) ||
            !isPlainObject(item.ENABLED) ||
            VIEWPORT_NAMES.some((viewport) => {
                return typeof item.ENABLED[viewport] !== 'boolean';
            })
        ) {
            throw new TypeError(
                'Each Home Current State item requires valid media, text, ' +
                'order, icon, variant, and viewport fields.',
            );
        }

        if (itemIds.has(item.ID)) {
            throw new TypeError(
                `Home Current State ID must be unique: ${item.ID}`,
            );
        }

        itemIds.add(item.ID);
    });

    return freezeSeeChenObject({
        MAX_VISIBLE: maxVisible,
        ITEMS: [...currentStateConfig.ITEMS].sort((first, second) => {
            return first.ORDER - second.ORDER;
        }),
    });
}

/**
 * Creates one configured Work project layout.
 * @param {!Object} project
 * @return {!Object}
 */
function createWorkProjectLayout(project) {
    const title = SEECHEN_I18N.t(
        HOME_NAMESPACE,
        project.TITLE_KEY,
    );
    const linkText = SEECHEN_I18N.t(
        HOME_NAMESPACE,
        project.LINK_TEXT_KEY,
    );
    const linkProps = {
        class: 'seechen-home__work-project-link',
        href: project.HREF,
        'aria-label': `${linkText}: ${title}`,
    };

    if (EXTERNAL_LINK_PATTERN.test(project.HREF)) {
        linkProps.target = '_blank';
        linkProps.rel = 'noreferrer';
    }

    return {
        tag: 'div',
        props: {
            class: 'seechen-home__work-project',
            'data-seechen-project': project.ID,
        },
        lang: HOME_NAMESPACE,
        children: [
            {
                tag: 'p',
                props: {
                    class: 'seechen-home__work-project-category',
                },
                children: [project.CATEGORY_KEY],
            },
            {
                tag: 'p',
                props: {
                    class: 'seechen-home__work-project-title',
                },
                children: [project.TITLE_KEY],
            },
            {
                tag: 'p',
                props: {
                    class: 'seechen-home__work-project-description',
                },
                children: [project.DESCRIPTION_KEY],
            },
            {
                tag: 'a',
                props: linkProps,
                children: [project.LINK_TEXT_KEY],
            },
        ],
    };
}

/**
 * Creates one configured Travel highlight card.
 * @param {!Object} highlight
 * @param {number} index
 * @param {string} displayMode
 * @return {!Object}
 */
function createTravelHighlightLayout(highlight, index, displayMode) {
    const title = SEECHEN_I18N.t(
        TRAVEL_NAMESPACE,
        highlight.TITLE_KEY,
    );
    const cardId = `seechenTravelHighlight-${highlight.ID}`;
    const imagePosition = highlight.IMAGE_POSITION[displayMode];
    const objectPosition = [
        imagePosition.HORIZONTAL,
        imagePosition.VERTICAL,
    ].map((position) => position.toLowerCase()).join(' ');

    return {
        tag: 'div',
        props: {
            id: cardId,
            class: 'seechen-home__travel-card',
            'data-seechen-travel-highlight': highlight.ID,
            'data-seechen-travel-index': index,
        },
        children: [
            {
                tag: 'img',
                props: {
                    class: 'seechen-home__travel-image',
                    src: highlight.IMAGE,
                    alt: SEECHEN_I18N.t(
                        TRAVEL_NAMESPACE,
                        highlight.ALT_KEY,
                    ),
                    loading: 'lazy',
                    decoding: 'async',
                    style: `object-position: ${objectPosition};`,
                },
                children: [],
            },
            {
                tag: 'div',
                props: {
                    class: 'seechen-home__travel-card-content',
                },
                lang: TRAVEL_NAMESPACE,
                children: [
                    {
                        tag: 'p',
                        props: {
                            class: 'seechen-home__travel-location',
                        },
                        children: [
                            {
                                tag: 'span',
                                props: {
                                    class: 'seechen-home__travel-location-icon',
                                    'aria-hidden': 'true',
                                },
                                children: [],
                            },
                            highlight.LOCATION_KEY,
                        ],
                    },
                    {
                        tag: 'h3',
                        props: {
                            class: 'seechen-home__travel-card-title',
                        },
                        children: [highlight.TITLE_KEY],
                    },
                    {
                        tag: 'p',
                        props: {
                            class: 'seechen-home__travel-description',
                        },
                        children: [highlight.DESCRIPTION_KEY],
                    },
                    {
                        tag: 'a',
                        props: {
                            class: 'seechen-home__travel-link',
                            href: highlight.HREF,
                            'aria-label': `${SEECHEN_I18N.t(
                                TRAVEL_NAMESPACE,
                                highlight.LINK_TEXT_KEY,
                            )}: ${title}`,
                        },
                        children: [highlight.LINK_TEXT_KEY],
                    },
                ],
            },
        ],
    };
}

/**
 * Creates one accessible Travel pagination control.
 * @param {!Object} highlight
 * @param {number} index
 * @return {!Object}
 */
function createTravelPaginationLayout(highlight, index) {
    const title = SEECHEN_I18N.t(
        TRAVEL_NAMESPACE,
        highlight.TITLE_KEY,
    );

    return {
        tag: 'button',
        props: {
            class: index === 0 ?
                'seechen-home__travel-dot is-active' :
                'seechen-home__travel-dot',
            type: 'button',
            'data-seechen-travel-index': index,
            'aria-controls': `seechenTravelHighlight-${highlight.ID}`,
            'aria-label': title,
            'aria-current': index === 0 ? 'true' : undefined,
        },
        children: [],
    };
}

/**
 * Creates a desktop Travel direction control.
 * @param {number} direction
 * @param {string} labelKey
 * @param {string} symbol
 * @return {!Object}
 */
function createTravelDirectionLayout(direction, labelKey, symbol) {
    return {
        tag: 'button',
        props: {
            class: direction < 0 ?
                'seechen-home__travel-arrow seechen-home__travel-arrow--previous' :
                'seechen-home__travel-arrow seechen-home__travel-arrow--next',
            type: 'button',
            'data-seechen-travel-direction': direction,
            'aria-label': SEECHEN_I18N.t('HOME', labelKey),
        },
        children: [symbol],
    };
}

/**
 * Creates the desktop arrows and shared Travel pagination.
 * @param {!Array<!Object>} highlights
 * @return {!Array<!Object>}
 */
function createTravelControlsLayout(highlights) {
    if (highlights.length === 0) {
        return [];
    }

    return [
        createTravelDirectionLayout(-1, 'TRAVEL_PREVIOUS', '\u2190'),
        {
            tag: 'div',
            props: {
                class: 'seechen-home__travel-pagination',
            },
            children: highlights.map(createTravelPaginationLayout),
        },
        createTravelDirectionLayout(1, 'TRAVEL_NEXT', '\u2192'),
    ];
}

/**
 * Creates one configurable Current State card.
 * @param {!Object} item
 * @return {!Object}
 */
function createCurrentStateLayout(item) {
    return {
        tag: 'div',
        props: {
            class: 'seechen-home__state-card',
            role: 'listitem',
            'data-seechen-state': item.ID,
            'data-seechen-state-variant': item.VARIANT.toLowerCase(),
        },
        children: [
            {
                tag: 'div',
                props: {
                    class: 'seechen-home__state-marker',
                },
                children: [
                    {
                        tag: 'span',
                        props: {
                            class: 'seechen-home__state-icon ' +
                                'seechen-home__state-icon--' +
                                item.ICON.toLowerCase(),
                            'aria-hidden': 'true',
                        },
                        children: [],
                    },
                    {
                        tag: 'p',
                        props: {
                            class: 'seechen-home__state-label',
                        },
                        lang: HOME_NAMESPACE,
                        children: [item.LABEL_KEY],
                    },
                ],
            },
            {
                tag: 'img',
                props: {
                    class: 'seechen-home__state-image',
                    src: item.IMAGE,
                    alt: SEECHEN_I18N.t(
                        HOME_NAMESPACE,
                        item.ALT_KEY,
                    ),
                    loading: 'lazy',
                    decoding: 'async',
                },
                children: [],
            },
            {
                tag: 'div',
                props: {
                    class: 'seechen-home__state-copy',
                },
                lang: HOME_NAMESPACE,
                children: [
                    {
                        tag: 'h3',
                        props: {
                            class: 'seechen-home__state-title',
                        },
                        children: [item.TITLE_KEY],
                    },
                    {
                        tag: 'p',
                        props: {
                            class: 'seechen-home__state-meta',
                        },
                        children: [item.META_KEY],
                    },
                    {
                        tag: 'p',
                        props: {
                            class: 'seechen-home__state-description',
                        },
                        children: [item.DESCRIPTION_KEY],
                    },
                ],
            },
        ],
    };
}

/**
 * Gets one section's ordered items visible in the current viewport.
 * @param {!Object} config
 * @param {string} viewport
 * @param {?function(!Object): boolean=} isVisible
 * @return {!Array<!Object>}
 */
function getVisibleItems(config, viewport, isVisible = null) {
    const items = isVisible ? config.ITEMS.filter(isVisible) : config.ITEMS;
    return items.slice(0, config.MAX_VISIBLE[viewport]);
}

/**
 * Populates responsive Home section data in a page-owned layout clone.
 * @param {!Object} layout
 * @param {!Object} pageState
 * @return {!Object}
 */
function populateHomeLayout(layout, pageState) {
    
    const viewport = SEECHEN_RESPONSIVE.getCurrentViewport();
    const displayMode = getTravelDisplayMode(viewport);
    const projectLayouts = getVisibleItems(
        pageState.workProjects,
        viewport,
    ).map(createWorkProjectLayout);
    const travelHighlights = getVisibleItems(
        pageState.travelHighlights,
        viewport,
        (highlight) => highlight.ENABLED[displayMode],
    );
    const travelLayouts = travelHighlights.map((highlight, index) => {
        return createTravelHighlightLayout(
            highlight,
            index,
            displayMode,
        );
    });
    const controlLayouts = createTravelControlsLayout(travelHighlights);
    const currentStateLayouts = getVisibleItems(
        pageState.currentState,
        viewport,
        (item) => item.ENABLED[viewport],
    ).map(createCurrentStateLayout);

    setSeeChenLayoutSlotChildren(
        layout,
        WORK_PROJECT_SLOT,
        projectLayouts,
    );
    setSeeChenLayoutSlotChildren(
        layout,
        TRAVEL_HIGHLIGHT_SLOT,
        travelLayouts,
    );
    setSeeChenLayoutSlotChildren(
        layout,
        TRAVEL_CONTROLS_SLOT,
        controlLayouts,
    );
    setSeeChenLayoutSlotChildren(
        layout,
        CURRENT_STATE_SLOT,
        currentStateLayouts,
    );

    const projectSlot = findSeeChenLayoutSlot(layout, WORK_PROJECT_SLOT);
    projectSlot.props.style =
        `--seechen-work-project-count: ${projectLayouts.length || 1};`;

    const travelSlot = findSeeChenLayoutSlot(
        layout,
        TRAVEL_HIGHLIGHT_SLOT,
    );
    travelSlot.props['aria-label'] = SEECHEN_I18N.t(
        HOME_NAMESPACE,
        'TRAVEL_CAROUSEL_LABEL',
    );

    const currentStateSlot = findSeeChenLayoutSlot(
        layout,
        CURRENT_STATE_SLOT,
    );

    currentStateSlot.props['aria-label'] = SEECHEN_I18N.t(
        HOME_NAMESPACE,
        'NARRATIVE_REGION_LABEL',
    );
    currentStateSlot.props.style =
        `--seechen-state-count: ${currentStateLayouts.length || 1};`;

    return layout;
}

/**
 * Mounts the configured year-chronicle player near its viewport.
 * @return {Function}
 */
function attachYearChronicle() {

    const player = document.querySelector(CHRONICLE_PLAYER_SELECTOR);

    if (!player || !activeState?.yearChronicle) {
        return null;
    }

    const config = activeState.yearChronicle;
    return SEECHEN_MEDIA_PLAYER.attach(player, {
        ...config,
        RESOLVE_VIDEO_LABEL() {
            return SEECHEN_I18N.t(
                HOME_NAMESPACE,
                CHRONICLE_VIDEO_LABEL_KEY,
            );
        },
    }, {
        signal: activeLifecycleContext?.signal,
    });
}

/**
 * Enables native Travel carousel navigation and active pagination.
 * @return {Function}
 */
function attachTravelCarousel() {
    const carousel = document.querySelector(TRAVEL_CAROUSEL_SELECTOR);
    const track    = carousel?.querySelector(TRAVEL_TRACK_SELECTOR);
    const cards    = track ? [...track.querySelectorAll(TRAVEL_CARD_SELECTOR)] : [];
    const controls = carousel ?
        [...carousel.querySelectorAll(TRAVEL_CONTROL_SELECTOR)] : [];
    const directionControls = carousel ?
        [...carousel.querySelectorAll(TRAVEL_DIRECTION_SELECTOR)] : [];

    if (!carousel || !track || cards.length === 0) {
        return () => {};
    }

    let activeIndex = -1;

    /**
     * Reflects the current card in every pagination control.
     * @param {number} index
     */
    function setActiveIndex(index) {

        if (index < 0 || index >= cards.length || index === activeIndex) {
            return;
        }

        activeIndex = index;
        controls.forEach((control, controlIndex) => {
            const isActive = controlIndex === activeIndex;
            control.classList.toggle('is-active', isActive);

            if (isActive) {
                control.setAttribute('aria-current', 'true');
            } else {
                control.removeAttribute('aria-current');
            }
        });

        directionControls.forEach((control) => {
            const direction = Number(
                control.dataset.seechenTravelDirection,
            );
            const isDisabled = direction < 0 ?
                activeIndex === 0 :
                activeIndex === cards.length - 1;

            control.disabled = isDisabled;
            control.setAttribute('aria-disabled', String(isDisabled));
        });

        carousel.classList.toggle(
            'has-previous',
            activeIndex > 0,
        );

        carousel.classList.toggle(
            'has-next',
            activeIndex < cards.length - 1,
        );
    }

    /**
     * Scrolls one card to the center of the Travel track.
     * @param {number} index
     */
    function moveTo(index) {
        if (index < 0 || index >= cards.length) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        setActiveIndex(index);
        const centeredOffset = cards[index].offsetLeft -
            (track.clientWidth - cards[index].offsetWidth) / 2;
        track.scrollTo({
            top: 0,
            left: Math.max(0, centeredOffset),
            behavior: reducedMotion ? 'auto' : 'smooth',
        });
    }

    /** Handles a click on any configured pagination dot. */
    function handleControlClick(event) {
        const directionControl = event.target.closest(
            TRAVEL_DIRECTION_SELECTOR,
        );

        if (directionControl && carousel.contains(directionControl)) {
            moveTo(
                activeIndex +
                Number(directionControl.dataset.seechenTravelDirection),
            );
            return;
        }

        const control = event.target.closest(TRAVEL_CONTROL_SELECTOR);

        if (!control || !carousel.contains(control)) {
            return;
        }

        moveTo(Number(control.dataset.seechenTravelIndex));
    }

    /** Supports focused left and right carousel navigation. */
    function handleTrackKeydown(event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }

        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const targetIndex = Math.min(
            cards.length - 1,
            Math.max(0, activeIndex + direction),
        );

        if (targetIndex !== activeIndex) {
            event.preventDefault();
            moveTo(targetIndex);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((first, second) => {
                return second.intersectionRatio - first.intersectionRatio;
            })[0];

        if (!visibleEntry) {
            return;
        }

        setActiveIndex(Number(
            visibleEntry.target.dataset.seechenTravelIndex,
        ));
    }, {
        root: track,
        threshold: [0.55, 0.7, 0.9],
    });

    cards.forEach((card) => observer.observe(card));
    setActiveIndex(0);
    carousel.addEventListener('click', handleControlClick);
    track.addEventListener('keydown', handleTrackKeydown);

    return () => {
        observer.disconnect();
        carousel.removeEventListener('click', handleControlClick);
        track.removeEventListener('keydown', handleTrackKeydown);
    };
}

/**
 * Updates viewport-dependent Home content after a breakpoint change.
 */
function refreshResponsiveContent() {
    if (
        !activeLayout ||
        !activeState ||
        !activeLifecycleContext?.isActive()
    ) {
        return;
    }

    const nextLayout = populateHomeLayout(activeLayout, activeState);

    travelCarouselCleanup?.();
    chronicleController?.detach();
    activeLifecycleContext.updateRegion(vDom.create(nextLayout));

    travelCarouselCleanup = attachTravelCarousel();
    chronicleController   = attachYearChronicle();
}

/**
 * Resolves the ordered full-page scroll targets.
 * @return {!Array<!Element>}
 */
function getScrollTargets() {
    const home = document.querySelector(HOME_SELECTOR);

    if (!home) {
        throw new Error('Home scroll targets are unavailable.');
    }

    return [...home.querySelectorAll(SCROLL_TARGET_SELECTOR)];
}

export default {
    /**
     * Loads configurable Home data without replacing the visible page shell.
     * @param {!Object} routeResult
     * @param {!Object} lifecycleContext
     * @return {!Promise<!Object>}
     */
    async load(routeResult, lifecycleContext) {

        const projectDataPath      = routeResult.data?.WORK_PROJECTS;
        const travelDataPath       = routeResult.data?.TRAVEL_HIGHLIGHTS;
        const chronicleDataPath    = routeResult.data?.YEAR_CHRONICLE;
        const currentStateDataPath = routeResult.data?.CURRENT_STATE;

        if (!isNonEmptyString(projectDataPath)) {
            throw new Error('Home route requires DATA.WORK_PROJECTS.');
        }

        if (!isNonEmptyString(travelDataPath)) {
            throw new Error('Home route requires DATA.TRAVEL_HIGHLIGHTS.');
        }

        if (!isNonEmptyString(chronicleDataPath)) {
            throw new Error('Home route requires DATA.YEAR_CHRONICLE.');
        }

        if (!isNonEmptyString(currentStateDataPath)) {
            throw new Error('Home route requires DATA.CURRENT_STATE.');
        }

        const [
            projectConfig,
            travelHighlightConfig,
            chronicleConfig,
            currentStateConfig,
        ] = await Promise.all([
            SEECHEN_RESOURCE.getJson(projectDataPath, {
                signal: lifecycleContext.signal,
            }),
            SEECHEN_RESOURCE.getJson(travelDataPath, {
                signal: lifecycleContext.signal,
            }),
            SEECHEN_RESOURCE.getJson(chronicleDataPath, {
                signal: lifecycleContext.signal,
            }),
            SEECHEN_RESOURCE.getJson(currentStateDataPath, {
                signal: lifecycleContext.signal,
            }),
        ]);

        return {
            workProjects: normalizeWorkProjectConfig(projectConfig),
            travelHighlights: normalizeTravelHighlightConfig(
                travelHighlightConfig,
            ),
            yearChronicle: requireYearChronicleConfig(chronicleConfig),
            currentState: normalizeCurrentStateConfig(currentStateConfig),
        };
    },

    /**
     * Injects loaded Home data into its JSON layout.
     * @param {!Object} layout
     * @param {!Object} routeResult
     * @param {!Object} pageState
     * @param {!Object} lifecycleContext
     * @return {!Object}
     */
    transformLayout(layout, routeResult, pageState, lifecycleContext) {

        activeLayout = layout;
        activeState = pageState;
        activeLifecycleContext = lifecycleContext;

        return populateHomeLayout(activeLayout, activeState);
    },

    /** Refreshes stateful component labels after translated VDOM is committed. */
    refreshLanguage() {
        chronicleController?.refreshText();
    },

    /**
     * Enables full-page Home transitions after its layout is committed.
     * @param {!Object} routeResult
     * @param {*} pageState
     * @param {!Object} lifecycleContext
     */
    mount(routeResult, pageState, lifecycleContext) {
        scrollCleanup?.();
        responsiveCleanup?.();
        travelCarouselCleanup?.();
        chronicleController?.detach();

        scrollCleanup = SEECHEN_SECTION_SCROLLER.attach({
            targets: getScrollTargets(),
            signal: lifecycleContext.signal,
        });

        responsiveCleanup = SEECHEN_RESPONSIVE.subscribe(
            refreshResponsiveContent,
        );

        travelCarouselCleanup = attachTravelCarousel();
        chronicleController   = attachYearChronicle();
    },

    /** Disables Home interactions before another page takes ownership. */
    unmount() {
        scrollCleanup?.();
        responsiveCleanup?.();
        travelCarouselCleanup?.();
        chronicleController?.detach();

        scrollCleanup          = null;
        responsiveCleanup      = null;
        travelCarouselCleanup  = null;
        chronicleController    = null;
        activeLayout           = null;
        activeState            = null;
        activeLifecycleContext = null;
    },
};
