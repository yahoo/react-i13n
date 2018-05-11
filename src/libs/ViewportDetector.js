/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var subscribe = require('subscribe-ui-event').subscribe;

var SUBSCRIBE_OPTIONS = {
    enableScrollInfo: true
};

var DEFAULT_VIEWPORT_MARGINS = {
    usePercent: false,
    top: 20,
    bottom: 20
};

/**
 * Viewport Detector
 * @param {Object} element DOM element to detect
 * @param {Object} [options] options object
 * @param {Object} [options.margins] viewport detection margin setting
 * @param {Object} [options.margins.top] viewport top margin setting
 * @param {Object} [options.margins.bottom] viewport bottom margin setting
 * @param {Object} [options.margins.usePercent] true to use top and bottom as percentage instead of pixel
 * @param {Object} [options.target] target of ui events, should be a dom element
 * @param {Function} onEnterViewport callback when the DOM element enters the viewport
 * @constructor
 */
var ViewportDetector = function ViewportDetector(element, options, onEnterViewport) {
    var marginOptions = (options && options.margins) || DEFAULT_VIEWPORT_MARGINS;
    var clientHeight = window.innerHeight;

    this._element = element;
    this._onEnterViewport = onEnterViewport;
    this._subscribers = [];
    this._rect;
    this._margins = {
        top: marginOptions.usePercent ? marginOptions.top * clientHeight : marginOptions.top,
        bottom: marginOptions.usePercent ? marginOptions.bottom * clientHeight : marginOptions.bottom
    };
    this._options = Object.assign({}, SUBSCRIBE_OPTIONS);
    if (options.target) {
        this._options.target = options.target;
    }
    this._enteredViewport = false;
};

/**
 * Detect viewport
 * @method _detectViewport
 * @returns {void}
 * @private
 */
ViewportDetector.prototype._detectViewport = function () {
    var innerHeight = window.innerHeight;
    if (!this._element) {
        return this._onEnterViewport && this._onEnterViewport();
    }
    var rect = this._element.getBoundingClientRect();

    // Detect Screen Bottom                           // Detect Screen Top
    if ((rect.top < innerHeight + this._margins.top) && (rect.bottom > 0  - this._margins.bottom)) {
        this._enteredViewport = true;
        this.unsubscribeAll();
        this._onEnterViewport && this._onEnterViewport();
    }
};

/**
 * Initialize the viewport detection
 * @method init
 * @param {Boolean} skipInitDetection skip the init detection
 * @returns {void}
 */
ViewportDetector.prototype.init = function (skipInitDetection) {
    // detect viewport and execute handler if it's initially in the viewport
    if (!skipInitDetection) {
        this._detectViewport();
    }

    if (!this._enteredViewport) {
        this._subscribers = [
            subscribe('scrollEnd', this._detectViewport.bind(this), this._options)
        ];
    }
};

/**
 * unsubscribe all ui event listeners
 * @method unsubscribeAll
 * @returns {void}
 */
ViewportDetector.prototype.unsubscribeAll = function () {
    this._subscribers.forEach(function forEachSubscriber (subscriber) {
        subscriber.unsubscribe();
    });
};

/**
 * Return the value if the element already entered the viewport
 * @method isEnteredViewport
 * @returns {Boolean} true if the element entered the viewport
 */
ViewportDetector.prototype.isEnteredViewport = function () {
    return this._enteredViewport;
};

module.exports = ViewportDetector;
