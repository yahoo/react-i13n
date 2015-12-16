/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var ReactI13n = require('../libs/ReactI13n');
var I13nUtils = require('../mixins/I13nUtils');

/**
 * Create an app level component with i13n setup
 * @param {Object} Component the top level component
 * @param {Object} options passed into ReactI13n
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.rootModelData model data of root i13n node
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @param {Array} plugins plugins
 * @method setupI13n
 */
module.exports = function setupI13n (Component, options, plugins) {
    var RootI13nComponent;
    var componentName = Component.displayName || Component.name;

    var reactI13n = new ReactI13n(options);
    plugins.forEach(function setPlugin(plugin) {
        reactI13n.plug(plugin);
    });

    RootI13nComponent = React.createClass({

        mixins: [I13nUtils],

        displayName: 'RootI13n' + componentName,

        /**
         * componentWillMount
         * @method componentWillMount
         */
        componentWillMount: function () {
            var reactI13n = ReactI13n.getInstance();
            reactI13n.createRootI13nNode();
        },

        render: function () {
            var props = Object.assign({}, {
                i13n: {
                    executeEvent: this.executeI13nEvent,
                    getI13nNode: this.getI13nNode
                }
            }, this.props);
            return React.createElement(
                Component,
                props,
                props.children
            );
        }
    });

    return RootI13nComponent;
};
