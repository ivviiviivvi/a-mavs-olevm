/**
 * @file images.js
 * @description Stills gallery configuration and event handlers
 * Uses shared Carousel module from js/modules/Carousel.js
 *
 * @author gabriel
 * @requires jQuery
 * @requires js/modules/Carousel.js
 */

'use strict';

/**
 * Caption data for stills gallery images
 */
const stillsData = {
  media: {
    1: 'Fires, fury, absolution.<br>Delusion, fantasy, insincerity.<br>Constants follow us.<br>News breaks us.',
    2: 'Culture, rocks, freedom.<br>Eat me, hide me.',
    3: "It's simple, belive us. Believe us. Believe us.",
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '',
    10: '',
    11: '',
    12: '',
    13: '',
    14: '',
    15: '',
    16: '',
    17: '',
    18: '',
    19: '',
    20: '',
    21: '',
    22: '',
    23: '',
  },
  live: {
    1: 'perception',
    2: '',
    3: '',
    4: '',
    5: '',
  },
  faster: {
    1: 'console, swell.<br>the clean within',
    2: '',
    3: '',
    4: '',
    5: '',
  },
  slip: {
    1: 'darkness',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
  },
};

/**
 * Real on-disk identifiers per collection, derived by scripts/gen-image-manifest.mjs
 * into js/imageManifest.js. Falls back to a 1..N range (legacy behaviour) if the
 * manifest script hasn't loaded — keeps images.js safe in chambers that don't ship it.
 * The stills fragment preloads the first 3 media frames (media1, media3, media4), so
 * those are skipped when appending the rest (entry[2] = preload count).
 */
const _MANIFEST = typeof IMAGE_MANIFEST !== 'undefined' ? IMAGE_MANIFEST : null;
const _stillIds = (name, count) =>
  _MANIFEST && _MANIFEST[name]
    ? _MANIFEST[name]
    : Array.from({ length: count }, (_, i) => String(i + 1));

const _stillsImages = [
  ['media', _stillIds('media', ETCETER4_CONFIG.images.media), 3],
  ['faster', _stillIds('faster', ETCETER4_CONFIG.images.faster), 0],
  ['slip', _stillIds('slip', ETCETER4_CONFIG.images.slip), 0],
  ['live', _stillIds('live', ETCETER4_CONFIG.images.live), 0],
];

/**
 * Stills carousel instance
 */
const stillsCarousel = new Carousel({
  id: '#stills',
  images: _stillsImages,
  // Total = count of images that actually exist (manifest-driven), so the
  // indicator (N/total) and navigation wrap are correct rather than over-counting.
  total: _stillsImages.reduce((sum, entry) => sum + entry[1].length, 0),
  indexLoadLeft: $('.stillsImage').length,
  loadOffset: ETCETER4_CONFIG.carousel.loadOffset,
  caption: $('#stillsCaption'),
  captionData: stillsData,
  imageSelector: '#stills .stillsImage',
});

// Initialize touch handlers for mobile swipe support
stillsCarousel.initTouchHandlers('dtc', 'dn');

// Bind navigation buttons using shared Carousel methods
stillsCarousel.bindNavButtons('#stills-left', '#stills-right', 'dtc', 'dn');

// Bind lazy-load handler for progressive image loading
stillsCarousel.bindLazyLoad();
