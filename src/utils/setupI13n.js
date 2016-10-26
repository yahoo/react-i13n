/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var ReactI13n = require('../libs/ReactI13n');
var I13nUtils = require('../mixins/I13nUtils');
var IS_CLIENT = typeof window !== 'undefined';

/**
 * Create an app level component with i13n setup
 * @param {Object} Component the top level component
 * @param {Object} options passed into ReactI13n
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.rootModelData model data of root i13n node
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @param {Object} options.displayName display name of the wrapper component
 * @param {Boolean} options.skipUtilFunctionsByProps true to prevent i13n util function to be passed via props.i13n
 * @param {Array} plugins plugins
 * @method setupI13n
 */
module.exports = function setupI13n (Component, options, plugins) {
    options = options || {};
    plugins = plugins || [];
    var RootI13nComponent;
    var componentName = Component.displayName || Component.name;

    RootI13nComponent = React.createClass({

        mixins: [I13nUtils],

        displayName: options.displayName || ('RootI13n' + componentName),

        autobind: false,

        /**
         * componentWillMount
         * @method componentWillMount
         */
        componentWillMount: function () {
            var reactI13n = new ReactI13n(options);
            this._reactI13nInstance = reactI13n;
            // we might have case to access reactI13n instance to execute event outside react components
            // assign reactI13n to window
            if (IS_CLIENT) {
                window._reactI13nInstance = reactI13n;
            }
            plugins.forEach(function setPlugin(plugin) {
                reactI13n.plug(plugin);
            });
            reactI13n.createRootI13nNode();
        },

        render: function () {
            var props = Object.assign({}, this.props);
            if (!options.skipUtilFunctionsByProps) {
                props.i13n = {
                    executeEvent: this.executeI13nEvent,
                    getI13nNode: this.getI13nNode,
                    reactI13nInstance: this._reactI13nInstance
                };
            }
            return React.createElement(
                Component,
                props,
                props.children
            );
        }
    });

    return RootI13nComponent;
};
