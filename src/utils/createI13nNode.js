/* global process */
/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var I13nMixin = require('../mixins/I13nMixin');
var hoistNonReactStatics = require('hoist-non-react-statics');

/**
 * createI13nNode higher order function to create a Component with I13nNode functionality
 * @param {Object|String} Component the component you want to create a i13nNode
 * @param {Object} defaultProps default props
 * @param {Object} options
 * @param {Object} options.displayName display name
 * @param {Object} options.refToWrappedComponent ref name to wrapped component
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
            var props = Object.assign({}, {
                i13n: {
                    executeEvent: this.executeI13nEvent,
                    getI13nNode: this.getI13nNode
                }
            }, this.props);

            if (options.refToWrappedComponent) {
                props.ref = options.refToWrappedComponent;
            }

            // delete the props that only used in this level
            props.i13nModel = undefined;

            if (!componentIsFunction) {
              // filter props to avoid to pass unknown props to components such <a> or <button>
              var propsToFilter = {
                  i13n: true,
                  i13nModel: true,
                  follow: true,
                  isLeafNode: true,
                  bindClickEvent: true,
                  scanLinks: true
              };
              props = Object.keys(props).reduce(function reduceProps(propsMap, propName) {
                  if (!propsToFilter.hasOwnProperty(propName)) {
                    propsMap[propName] = props[propName];
                  }
                  return propsMap;
              }, {});
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
