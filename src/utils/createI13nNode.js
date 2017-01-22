/* global process */
/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var hoistNonReactStatics = require('hoist-non-react-statics');
var PROPS_TO_FILTER = [
    'bindClickEvent',
    'follow',
    'followLink',
    'i13nModel',
    'isLeafNode',
    'scanLinks'
];
var ComponentSpecs = require('../libs/ComponentSpecs');

function objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
        if (keys.indexOf(i) >= 0) {
            continue;
        }
        if (!Object.prototype.hasOwnProperty.call(obj, i)) {
            continue;
        }
        target[i] = obj[i];
    }
    return target;
}

function mixin(target, source) {
    target = target.prototype;
    source = source;
    Object.getOwnPropertyNames(source).forEach(function (name) {
        if (name !== "constructor") {
            Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
        }
    });
}

/**
 * createI13nNode higher order function to create a Component with I13nNode functionality
 * @param {Object|String} Component the component you want to create a i13nNode
 * @param {Object} defaultProps default props
 * @param {Object} options
 * @param {String} options.displayName display name
 * @param {String} options.refToWrappedComponent ref name to wrapped component
 * @param {Boolean} options.skipUtilFunctionsByProps true to prevent i13n util function to be passed via props.i13n
 * @method createI13nNode
 */
module.exports = function createI13nNode (Component, defaultProps, options) {

    if (!Component) {
        if ('production' !== process.env.NODE_ENV) {
            console && console.warn && console.warn('You are passing a null component into createI13nNode');
            console && console.trace && console.trace();
        }
        return;
    }
    var componentName = Component.displayName || Component.name || Component;
    var componentIsFunction = 'function' === typeof Component;
    defaultProps = Object.assign({}, {
        i13nModel: null,
        isLeafNode: false,
        bindClickEvent: false,
        follow: false,
        scanLinks: null
    }, defaultProps);

    options = options || {};

    class I13nComponent extends React.Component {
        constructor(props) {
            super(props);
        }
        render () {
            // filter i13n related props
            if ('production' !== process.env.NODE_ENV && undefined !== this.props.followLink) {
                console && console.warn && console.warn('props.followLink support is deprecated, please use props.follow instead.');
            }
            var props = objectWithoutProperties(this.props, PROPS_TO_FILTER);
            
            if (options.refToWrappedComponent) {
                props.ref = options.refToWrappedComponent;
            }
            
            if (!props.i13n && !options.skipUtilFunctionsByProps && componentIsFunction) {
                props.i13n = {
                    executeEvent: this.executeI13nEvent.bind(this),
                    getI13nNode: this.getI13nNode.bind(this)
                };
            }

            return React.createElement(
                Component,
                props,
                props.children
            );
        }
    }
    
    mixin(I13nComponent, ComponentSpecs.pickSpecs());

    I13nComponent.displayName = options.displayName || ('I13n' + componentName);
    I13nComponent.defaultProps = defaultProps;

    I13nComponent = Object.assign(I13nComponent, ComponentSpecs.staticSpecs);

    if (componentIsFunction) {
        hoistNonReactStatics(I13nComponent, Component);
    }

    return I13nComponent;
};
