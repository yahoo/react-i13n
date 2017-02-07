/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * Mixin the attributes and functions to target's prototype
 * @param {Object} target React component
 * @param {Object} source the mixin source
 * @method componentMixin
 */
module.exports = function componentMixin(target, source) {
    target = target.prototype;
    source = source;
    Object.getOwnPropertyNames(source).forEach(function (name) {
        if (name !== "constructor") {
            Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
        }
    });
}
