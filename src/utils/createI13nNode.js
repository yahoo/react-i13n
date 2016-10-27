/* global process */
/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var I13nMixin = require('../mixins/I13nMixin');
var hoistNonReactStatics = require('hoist-non-react-statics');
var PROPS_TO_FILTER = [
    'bindClickEvent',
    'follow',
    'i13nModel',
    'isLeafNode',
    'scanLinks'
];

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
    defaultProps = defaultProps || {};
    options = options || {};

    var I13nComponent = React.createClass({
        displayName: options.displayName || ('I13n' + componentName),
        mixins: [I13nMixin],
        autobind: false,

        /**
         * getDefaultProps
         * @method getDefaultProps
         * @return {Object} default props
         */
        getDefaultProps: function () {
            return Object.assign({}, {
                i13nModel: null,
                isLeafNode: false,
                bindClickEvent: false,
                follow: false,
                scanLinks: null
            }, defaultProps);
        },

        /**
         * render
         * @method render
         */
        render: function () {
            // filter i13n related props
            var props = objectWithoutProperties(this.props, PROPS_TO_FILTER);
            
            if (options.refToWrappedComponent) {
                props.ref = options.refToWrappedComponent;
            }
            
            if (!options.skipUtilFunctionsByProps && componentIsFunction) {
                props.i13n = {
                    executeEvent: this.executeI13nEvent,
                    getI13nNode: this.getI13nNode
                };
            }

            return React.createElement(
                Component,
                props,
                props.children
            );
        }
    });

    if (componentIsFunction) {
        hoistNonReactStatics(I13nComponent, Component);
    }

    return I13nComponent;
};
