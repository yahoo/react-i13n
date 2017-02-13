/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

import merge from 'lodash/merge';

const REACT_LIFE_CYCLE_FUNCTIONS = {
    componentDidMount: true,
    componentDidUpdate: true,
    componentWillMount: true,
    componentWillReceiveProps: true,
    componentWillUnmount: true,
    componentWillUpdate: true,
    shouldComponentUpdate: true
};

const REACT_STATIC_PROPS = {
    childContextTypes: true,
    contextTypes: true,
    propTypes: true
};

/**
 * Add prototype/static properties to the target
 * NOTE: This util is used to provide a component with the i13n functionalities with ComponentSpec.js
 * Which is a pure object to support BC of I13nMixin and I13nUtil
 * For regular usage we will still suggest to use ES6 extends
 * @method augmentComponent
 * @param {Object} target React component
 * @param {Object} prototypeProps the prototype source to augment target, if it's react lifecycle function then execute both original and new one
 * @param {Object} staticProps the static source to augment target, if it's react static props then do a merge
 */
module.exports = function augmentComponent(target, prototypeProps, staticProps) {
    prototypeProps = prototypeProps || {};
    staticProps = staticProps || {};
    Object.getOwnPropertyNames(prototypeProps).forEach((name) => {
        if (name !== "constructor") {
            if (REACT_LIFE_CYCLE_FUNCTIONS[name]) {
                let oldFunction = target.prototype[name];
                if (oldFunction) {
                    target.prototype[name] = (...args) => {
                        // execute both except shouldComponentUpdate 
                        if (name === 'shouldComponentUpdate') {
                            return oldFunction.apply(this, args) && prototypeProps[name].apply(this, args);
                        } else {
                            oldFunction.apply(this, args);
                            prototypeProps[name].apply(this, args);
                        }
                    };
                } else {
                    target.prototype[name] = prototypeProps[name];
                }
            } else {
                Object.defineProperty(target.prototype, name, Object.getOwnPropertyDescriptor(prototypeProps, name));
            }
        }
    });
    Object.keys(staticProps).forEach((name) => {
        if (REACT_STATIC_PROPS[name]) {
            target[name] = merge(target[name], staticProps[name]);
        } else {
            target[name] = staticProps[name];
        }
    });
    return target;
};
