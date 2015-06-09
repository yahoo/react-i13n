/* global process */
/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var I13nMixin = require('../mixins/I13nMixin');
var objectAssign = require('object-assign');
var hoistNonReactStatics = require('hoist-non-react-statics');

/**
 * createI13nNode higher order function to create a Component with I13nNode functionality
 * @param {Object|String} Component the component you want to create a i13nNode 
 * @method createI13nNode
 */
module.exports = function createI13nNode (Component, options) {
    if (!Component) {
        if ('production' !== process.env.NODE_ENV) {
            console && console.warn && console.warn('You are passing a null component into createI13nNode');
            console && console.trace && console.trace();
        }
        return;
    }
    var componentName = Component.displayName || Component.name || Component;
    options = options || {};
   
    var I13nComponent = React.createClass(objectAssign({}, I13nMixin, {
        displayName: 'I13n' + componentName,

        /**
         * getDefaultProps
         * @method getDefaultProps
         * @return {Object} default props
         */
        getDefaultProps: function () {
            return {
                model: options.model || null,
                i13nModel: options.i13nModel || null,
                isLeafNode: options.isLeafNode || false,
                bindClickEvent: options.bindClickEvent || false,
                follow: options.follow || false
            };
        },
        
        /**
         * render
         * @method render
         */
        render: function () {
            var props = objectAssign({}, this.props);

            // delete the props that only used in this level
            try {
                delete props.model;
                delete props.i13nModel;
                delete props.viewport;
            } catch (e) {
                props.model = undefined;
                props.i13nModel = undefined;
                props.viewport = undefined;
            }

            return React.createElement(
                Component,
                props,
                props.children
            );
        }
    }));
    
    if ('function' === typeof Component) {
        hoistNonReactStatics(I13nComponent, Component);
    }

    return I13nComponent;
};
