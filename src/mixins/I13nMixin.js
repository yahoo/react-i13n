/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals location */
'use strict';

var React = require('react');
var ReactI13n = require('../libs/ReactI13n');
var clickHandler = require('../utils/clickHandler');
var EventListener = require('react/lib/EventListener');
var ViewportMixin = require('./viewport/ViewportMixin');
var DebugDashboard = require('../utils/DebugDashboard');
require('setimmediate');
var IS_DEBUG_MODE = isDebugMode();

function isDebugMode () {
    function getJsonFromUrl() {
        var query = location.search.substr(1);
        var result = {};
        query.split('&').forEach(function(part) {
            var item = part.split('=');
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }

    if ('undefined' === typeof location) {
        return false;
    }

    return (getJsonFromUrl().i13n_debug === '1') ? true : false;
}

/**
 * React.js I13n Mixin
 * Append the functions needed to create an i13n node
 * @class I13nMixin
 */
var I13nMixin = {
    
    mixins: [ViewportMixin],

    propTypes: {
        component: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
        model: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        i13nModel: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        isLeafNode: React.PropTypes.bool,
        bindClickEvent: React.PropTypes.bool,
        follow: React.PropTypes.bool
    },
    
    /**
     * getChildContext
     * @method getChildContext
     */
    getChildContext: function () {
        return {
            parentI13nNode: this._i13nNode
        };
    },
    
    /**
     * getDefaultProps
     * @method getDefaultProps
     * @return {Object} default props
     */
    getDefaultProps: function () {
        return {
            model: null,
            i13nModel: null
        };
    },

    childContextTypes: {
        parentI13nNode: React.PropTypes.object
    },

    contextTypes: {
        parentI13nNode: React.PropTypes.object
    },

    /**
     * componentDidMount
     * @method componentDidMount
     */
    componentDidMount: function () {
        var self = this;

        if (!self._getReactI13n()) {
            return;
        }

        // bind the click event for i13n component if it's enabled
        if (self.props.bindClickEvent) {
            self.clickEventListener = EventListener.listen(self.getDOMNode(), 'click', clickHandler.bind(self));
        }
        
        self._i13nNode.setDOMNode(self.getDOMNode());

        // enable viewport checking if enabled
        if (self._getReactI13n().isViewportEnabled()) {
            self.subscribeViewportEvents();
            self._enableViewportDetection();
        }

        if (IS_DEBUG_MODE) {
            setImmediate(function asyncShowDebugDashboard() {
                self._debugDashboard = new DebugDashboard(self._i13nNode); 
            });
        }
        self._executeI13nEvent('created', {});
    },

    /**
     * componentWillMount
     * @method componentWillMount
     */
    componentWillMount: function () {
        if (!this._getReactI13n()) {
            return;
        }
        this._createI13nNode();
    },

    /**
     * componentWillUnmount
     * @method componentWillUnmount
     */
    componentWillUnmount: function () {
        if (!this._getReactI13n()) {
            return;
        }
        var parentI13nNode = this._getParentI13nNode();
        if (parentI13nNode) {
            parentI13nNode.removeChildNode(this._i13nNode);
        }

        if (this.clickEventListener) {
            this.clickEventListener.remove();
        }
        
        if (this._getReactI13n().isViewportEnabled()) {
            this.unsubscribeViewportEvents();
        }
       
        // remove debug dashboard
        if (IS_DEBUG_MODE && this._debugDashboard) {
            this._debugDashboard.destroy();
        }
    },
   
    /**
     * _enableViewportDetection for react-viewport
     * @method _enableViewportDetection
     * @private
     */
    _enableViewportDetection: function () {
        this.onEnterViewport(this._handleEnterViewport);
        // TODO remove this manually functiona calling if mixin support the initial detection
        ViewportMixin._detectViewport.apply(this);
        ViewportMixin._detectHidden.apply(this);
    },

    /**
     * _handleEnterViewport for react-viewport
     * @method _handleEnterViewport
     * @private
     */
    _handleEnterViewport: function () {
        if (!this._i13nNode.isInViewport()) {
            this._i13nNode.setIsInViewport(true);
            this._executeI13nEvent('enterViewport', {});
        }
    },
    
    /**
     * _createI13nNode
     * @method _createI13nNode
     * @private
     */
    _createI13nNode: function () {
        // check if reactI13n is initialized successfully, otherwise return
        var self = this;
        var I13nNode = self._getReactI13n().getI13nNodeClass();
        var parentI13nNode = self._getParentI13nNode();
        // TODO @kaesonho remove BC for model
        self._i13nNode = new I13nNode(
            parentI13nNode, 
            self.props.i13nModel || self.props.model,
            self.isLeafNode(), 
            self._getReactI13n().isViewportEnabled());
    },

    /**
     * execute the i13n event
     * @method _executeI13nEvent
     * @param {String} eventName event name
     * @param {Object} payload payload object
     * @param {Function} callback function
     * @async
     * @private
     */
    _executeI13nEvent: function (eventName, payload, callback) {
        payload = payload || {};
        payload.i13nNode = this._i13nNode;
        this._getReactI13n().execute(eventName, payload, callback);
    },
    
    /**
     * get React I13n instance
     * @method _getReactI13n
     * @private
     * @return {Object} react i13n instance
     */
    _getReactI13n: function () {
        return ReactI13n.getInstance();
    },

    /**
     * _getParentI13nNode, defualt would go to the rootI13nNode
     * @method _getParentI13nNode
     * @private
     * @return {Object} parent i13n node
     */
    _getParentI13nNode: function () {
        // https://twitter.com/andreypopp/status/578974316483608576, get the context from parent context
        // TODO remove this at react 0.14
        var context = (this._reactInternalInstance && this._reactInternalInstance._context) || this.context;
        return (context && context.parentI13nNode) || this._getReactI13n().getRootI13nNode();
    },

    /**
     * isLeafNode
     * @method isLeafNode
     * @return {Boolean} if the node is a leaf link node
     */
    isLeafNode: function () {
        return this.props.isLeafNode || false;
    }
};

module.exports = I13nMixin;
