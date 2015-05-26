/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var I13nMixin = require('../mixins/I13nMixin');
var objectAssign = require('object-assign');
var STATIC_CLONE_BLACK_LIST = [
    'childContextTypes',
    'contextTypes',
    'displayName',
    'getDefaultProps',
    'isReactLegacyFactory',
    'propTypes',
    'type'
];

/**
 * createI13nNode higher order function to create a Component with I13nNode functionality
 * @param {Object|String} Component the component you want to create a i13nNode 
 * @method createI13nNode
 */
module.exports = function createI13nNode (Component, options) {
    var componentName = Component.displayName || Component.name || Component;
    var staticsObject = {};
    options = options || {};
   
    if ('function' === typeof Component) {
        // clone the all the static functions except the black list
        Object.keys(Component).forEach(function cloneStaticProperty (key) {
            if (Component.hasOwnProperty(key) && -1 === STATIC_CLONE_BLACK_LIST.indexOf(key)) {
                staticsObject[key] = Component[key];
            }   
        });
    }

    var I13nComponent = React.createClass(objectAssign({}, I13nMixin, {statics: staticsObject}, {
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
    return I13nComponent;
};
