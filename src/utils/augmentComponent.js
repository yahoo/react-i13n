/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * Add prototype/static properties to the target
 * please note that this is a helper function to generate the i13n component, just assign properties anyways instead of handling the React life cycle 
 * @method augmentComponent
 * @param {Object} target React component
 * @param {Object} prototypeProps the prototype source to augment target
 * @param {Object} staticProps the static source to augment target
 */
module.exports = function augmentComponent(target, prototypeProps, staticProps) {
    prototypeProps = prototypeProps || {};
    staticProps = staticProps || {};
    Object.getOwnPropertyNames(prototypeProps).forEach(function forEachProperty(name) {
        if (name !== "constructor") {
            Object.defineProperty(target.prototype, name, Object.getOwnPropertyDescriptor(prototypeProps, name));
        }
    });
    Object.assign(target, staticProps);
    return target;
}
