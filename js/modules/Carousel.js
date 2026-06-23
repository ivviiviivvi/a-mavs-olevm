/**
 * @file Carousel.js
 * @description Shared carousel module for image galleries
 * Used by both stills and diary sections
 *
 * @requires jQuery
 * @requires page.js - Page navigation system
 */

'use strict';

/**
 * Appends a series of numbered images to a DOM element
 * Used for gallery-style image loading with sequential numbering
 *
 * @param {string} element - CSS selector for the container element
 * @param {string} location - Base path to the image directory
 * @param {string} prefix - Filename prefix before the identifier (e.g., "media")
 * @param {string} fileExtension - File extension including the period (e.g., ".jpg", ".png")
 * @param {Array<string|number>} ids - Explicit identifiers that exist on disk
 *   (e.g. ['1','3','4','7'] for a sparse archive, or ['1','1a','2'] for suffixed files).
 *
 * @example
 * appendImagesTo('#stills', 'img/photos/media/', 'media', '.jpg', ['1', '3', '4']);
 */
function appendImagesTo(element, location, prefix, fileExtension, ids) {
  const srcContents = location + prefix;
  const $element = $(element);
  // Performance optimization: Build string first to minimize DOM reflows
  // Instead of appending in each iteration, batch into single append
  let content = '';
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    content +=
      '<div class="stillsImage dn v-mid heightControl-stills min-h-21_875rem min-h-28_125rem-ns tc h-100">' +
      '<img class="mw-100 mh-100 w-auto h-auto anim anim-easeout" src="' +
      srcContents +
      id +
      fileExtension +
      '" alt="Gallery image ' +
      id +
      // Belt-and-suspenders: if a file is ever missing, hide the frame rather than
      // show a broken-image icon. The id list above should already be real files only.
      '" onerror="this.style.display=\'none\'"/>' +
      '</div>';
  }
  $element.append(content);
}

/**
 * Replaces placeholder images with actual images for lazy loading
 * Searches for images with src="img/placeholder.jpg" and replaces them
 * with the actual source from the data-src attribute
 *
 * @param {string} element - CSS selector for the container to search within
 *
 * @example
 * replacePlaceholders('#stills');
 */
function replacePlaceholders(element) {
  const images = $(element).find("img[src='img/placeholder.jpg']");
  if (images.length !== 0) {
    images.each(function () {
      const actualImage = $(this).attr('data-src');
      if (actualImage) {
        $(this).attr('src', actualImage);
      }
    });
  }
}

/**
 * Carousel Class
 *
 * A reusable carousel component for image galleries
 */
class Carousel {
  /**
   * Create a Carousel instance
   * @param {Object} config - Carousel configuration
   * @param {string} config.id - Container element ID (e.g., '#stills')
   * @param {Page|null} config.page - Associated Page object
   * @param {jQuery|null} config.caption - Caption element
   * @param {number} config.index - Current image index
   * @param {number} config.total - Total number of images
   * @param {Array} config.images - Image data array
   * @param {number} config.loadOffset - Offset for lazy loading
   * @param {Object} config.captionData - Caption data object for this carousel
   */
  constructor(config) {
    this.id = config.id || '';
    this.page = config.page || null;
    this.caption = config.caption || null;
    this.index = config.index || 0;
    this.total = config.total || 0;
    this.images = config.images || [];
    this.loadOffset = config.loadOffset || 0;
    this.indexLoadLeft = config.indexLoadLeft || 0;
    this.indexLoadRight = config.indexLoadRight || this.total - 1;
    this.totalLoaded = config.totalLoaded || 0;
    this.captionData = config.captionData || {};
    this.imageSelector = config.imageSelector || '.stillsImage';

    // Touch handler state
    this._touchActiveClass = null;
    this._touchHiddenClass = null;
    this._touchHandlersInitialized = false;
  }

  /**
   * Increment the current index with wrapping
   */
  incIndex() {
    const newIndex = this.index + 1;
    if (newIndex > this.total - 1) {
      this.setIndex(0);
    } else {
      this.index = newIndex;
    }
  }

  /**
   * Decrement the current index with wrapping
   */
  decIndex() {
    const newIndex = this.index - 1;
    if (newIndex < 0) {
      this.setIndex(this.total - 1);
    } else {
      this.index = newIndex;
    }
  }

  /**
   * Set the current index
   * @param {number} n - New index value
   */
  setIndex(n) {
    this.index = n;
  }

  /**
   * Load caption for the current image
   * @param {jQuery} img - Image element
   */
  loadCaption(img) {
    if (!this.caption || !this.captionData) {
      return;
    }

    const imgSrc = img.children().attr('src');
    if (!imgSrc) {
      this.caption.html('');
      return;
    }

    const regExp = /img\/photos\/[a-z]*\/([a-z]*)(\d*)/g;
    const match = regExp.exec(imgSrc);

    if (!match) {
      this.caption.html('');
      return;
    }

    const name = match[1];
    const num = match[2];
    const caption = this.captionData[name]?.[num];

    if (caption !== undefined && caption !== '') {
      this.caption.html(caption);
    } else {
      this.caption.html('');
    }
  }

  /**
   * Update the indicator display
   */
  setIndicator() {
    const adjIndex = this.index + 1;
    const indicatorId =
      this.id === '#stills' ? '#stills-indicator' : '#diary-indicator';
    $(indicatorId).text(adjIndex.toString() + '/' + this.total);
  }

  /**
   * Load all images for this carousel
   * @returns {boolean} True if images were loaded
   */
  loadImages() {
    try {
      const page = Page.findPage(this.id);
      if (page.hasAllData) {
        return false;
      }

      const images = this.images;
      if (!images || images.length === 0) {
        return false;
      }

      for (let i = 0; i < images.length; i++) {
        const name = images[i][0];
        // entry[1] is either an explicit id list (manifest-driven) or a legacy
        // numeric count. entry[2] is how many leading ids are already preloaded in
        // the fragment HTML and must be skipped to avoid duplicate frames.
        let ids = images[i][1];
        const preload = images[i][2] || 0;
        if (typeof ids === 'number') {
          ids = Array.from({ length: ids }, (_, n) => String(n + 1));
        }
        appendImagesTo(
          this.id + ' #imageContainer',
          'img/photos/' + name + '/',
          name,
          '.jpg',
          ids.slice(preload)
        );
      }

      page.hasAllData = true;
      return true;
    } catch (error) {
      console.error('Error loading carousel images:', error.message);
      return false;
    }
  }

  /**
   * Emit a slide event
   * @param {string} dir - Direction of slide ('left' or 'right')
   */
  emitSlide(dir) {
    $(this.id).trigger('carousel:slide', [
      this.index,
      this.indexLoadLeft,
      this.indexLoadRight,
      this.images,
      dir,
      this,
    ]);
  }

  /**
   * Update total loaded count
   */
  updateTotalLoaded() {
    this.totalLoaded = $(this.imageSelector).length;
  }

  /**
   * Navigate to the previous image
   * @param {string} activeClass - CSS class for active image (e.g., 'dtc')
   * @param {string} hiddenClass - CSS class for hidden image (e.g., 'dn')
   */
  navigatePrev(activeClass, hiddenClass) {
    const img = $(this.imageSelector + '.' + activeClass);
    const tmpIndex = this.index;

    this.decIndex();
    this.emitSlide('left');
    this.setIndicator();
    img.removeClass(activeClass).addClass(hiddenClass);

    let loadingImage;
    if (tmpIndex !== 0) {
      loadingImage = img.prev();
    } else {
      loadingImage = $(this.imageSelector).last();
    }

    loadingImage.addClass(activeClass).removeClass(hiddenClass);
    loadingImage.children().addClass('anim-fadeIn');

    if (this.caption) {
      this.loadCaption(loadingImage);
    }
  }

  /**
   * Navigate to the next image
   * @param {string} activeClass - CSS class for active image (e.g., 'dtc')
   * @param {string} hiddenClass - CSS class for hidden image (e.g., 'dn')
   */
  navigateNext(activeClass, hiddenClass) {
    const img = $(this.imageSelector + '.' + activeClass);
    const tmpIndex = this.index + 1;

    this.incIndex();
    this.emitSlide('right');
    this.setIndicator();
    img.removeClass(activeClass).addClass(hiddenClass);

    let loadingImage;
    if (tmpIndex < this.total) {
      loadingImage = img.next();
    } else {
      loadingImage = $(this.imageSelector).first();
    }

    loadingImage.addClass(activeClass).removeClass(hiddenClass);
    loadingImage.children().addClass('anim-fadeIn');

    if (this.caption) {
      this.loadCaption(loadingImage);
    }
  }

  /**
   * Bind click handlers to navigation buttons
   * Uses navigatePrev/navigateNext internally
   * @param {string} leftSel - jQuery selector for the "previous" button
   * @param {string} rightSel - jQuery selector for the "next" button
   * @param {string} activeClass - CSS class for the visible image
   * @param {string} hiddenClass - CSS class for hidden images
   */
  bindNavButtons(leftSel, rightSel, activeClass, hiddenClass) {
    const self = this;
    $(leftSel).on('click', () => self.navigatePrev(activeClass, hiddenClass));
    $(rightSel).on('click', () => self.navigateNext(activeClass, hiddenClass));
  }

  /**
   * Bind the carousel:slide event for lazy image loading
   * Automatically loads more images when the user reaches the load boundary.
   * Unbinds itself once all data is loaded.
   */
  bindLazyLoad() {
    if (this._lazyLoadBound) {
      return;
    }
    this._lazyLoadBound = true;
    const self = this;

    $(this.id).on(
      'carousel:slide',
      (
        event,
        _index,
        _indexLoadLeft,
        _indexLoadRight,
        _images,
        _dir,
        _this
      ) => {
        try {
          const page = Page.findPage(self.id);
          if (page.hasAllData === true) {
            $(self.id).off('carousel:slide');
            self._lazyLoadBound = false;
            return;
          } else if (_index === _indexLoadLeft || _index === _indexLoadRight) {
            _this.loadImages();
          }
        } catch (error) {
          console.error(
            `Error in ${self.id} carousel slide handler:`,
            error.message
          );
        }
      }
    );
  }

  /**
   * Initialize touch handlers for swipe navigation
   * Stores active/hidden classes for use in destroy method
   * @param {string} activeClass - CSS class for active image (e.g., 'dtc')
   * @param {string} hiddenClass - CSS class for hidden image (e.g., 'dn')
   */
  initTouchHandlers(activeClass, hiddenClass) {
    const self = this;
    const container = $(this.id);
    const swipeThreshold =
      typeof ETCETER4_CONFIG !== 'undefined'
        ? ETCETER4_CONFIG.carousel.swipeThreshold
        : 50;

    // Store for cleanup
    this._touchActiveClass = activeClass;
    this._touchHiddenClass = hiddenClass;
    this._touchHandlersInitialized = true;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    container.on('touchstart.carousel', function (e) {
      touchStartX = e.originalEvent.touches[0].clientX;
      touchStartY = e.originalEvent.touches[0].clientY;
    });

    container.on('touchend.carousel', function (e) {
      touchEndX = e.originalEvent.changedTouches[0].clientX;
      touchEndY = e.originalEvent.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Only trigger if horizontal swipe is greater than vertical (prevent scroll interference)
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > swipeThreshold
      ) {
        if (deltaX > 0) {
          // Swipe right - go to previous
          self.navigatePrev(activeClass, hiddenClass);
        } else {
          // Swipe left - go to next
          self.navigateNext(activeClass, hiddenClass);
        }
      }
    });
  }

  /**
   * Destroy touch handlers for cleanup
   * Should be called when navigating away from carousel page
   */
  destroyTouchHandlers() {
    if (this._touchHandlersInitialized) {
      $(this.id).off('touchstart.carousel touchend.carousel');
      this._touchHandlersInitialized = false;
    }
  }

  /**
   * Full cleanup method for carousel
   * Removes all event handlers and resets state
   */
  destroy() {
    this.destroyTouchHandlers();
    $(this.id).off('carousel:slide');
    this._lazyLoadBound = false;
  }
}
