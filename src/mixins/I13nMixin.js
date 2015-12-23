/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals location */
'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var debug = require('debug')('I13nMixin');
var ReactI13n = require('../libs/ReactI13n');
var clickHandler = require('../utils/clickHandler');
var EventListener = require('fbjs/lib/EventListener');
var ViewportMixin = require('./viewport/ViewportMixin');
var I13nUtils = require('./I13nUtils');
var DebugDashboard = require('../utils/DebugDashboard');
require('setimmediate');
var IS_DEBUG_MODE = isDebugMode();
var DEFAULT_SCAN_TAGS = ['a', 'button'];
var pageInitViewportDetectionTimeout = null;
var pageInitViewportDetected = false;

function convertToArray (arr) {
    try {
        // try using .slice()
        return Array.prototype.slice.call(arr);
    } catch (e) {
        // otherwise, manually create the array
        var i;
        var length = arr.length;
        var result = [];
        for (i = 0; i < length; i = i + 1) {
            result.push(arr[i]);
        }
        return result;
    }
}

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

    mixins: [I13nUtils, ViewportMixin],

    propTypes: {
        component: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
        model: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        i13nModel: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        isLeafNode: React.PropTypes.bool,
        bindClickEvent: React.PropTypes.bool,
        follow: React.PropTypes.bool,
        scanLinks: React.PropTypes.shape({
            enable: React.PropTypes.bool,
            tags: React.PropTypes.array
        })
    },

    /**
     * componentWillUpdate
     * @method componentWillUpdate
     */
    componentWillUpdate: function (nextProps, nextState) {
        var self = this;

        if (nextProps && self._i13nNode) {
            self._i13nNode.updateModel(nextProps.model || nextProps.i13nModel);
        }
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
            self.clickEventListener = EventListener.listen(ReactDOM.findDOMNode(self), 'click', clickHandler.bind(self));
        }

        self._i13nNode.setDOMNode(ReactDOM.findDOMNode(self));

        // enable viewport checking if enabled
        if (self._getReactI13n().isViewportEnabled()) {
            self.subscribeViewportEvents();
            self._enableViewportDetection();
        }
        self.executeI13nEvent('created', {});
        if (self.props.scanLinks && self.props.scanLinks.enable) {
            self._scanLinks();
        }

        if (IS_DEBUG_MODE) {
            setImmediate(function asyncShowDebugDashboard() {
                self._debugDashboard = new DebugDashboard(self._i13nNode);
            });
        }
    },

    /**
     * componentWillMount
     * @method componentWillMount
     */
    componentWillMount: function () {
        if (!this._getReactI13n()) {
            return;
        }
        clearTimeout(pageInitViewportDetectionTimeout);
        this._createI13nNode();
        this._i13nNode.setReactComponent(this);
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
        if (IS_DEBUG_MODE) {
            this._debugDashboard && this._debugDashboard.destroy();
        }

        this._removeSubComponentsListenersAndDebugDashboards();
    },

    /**
     * scan links, if user enable it, scan the links(users can define the tags they want) with componentDidMount,
     * and this function will find all the elements by getElementsByTagName, then
     * 1. create i13n node
     * 2. bind the click event
     * 3. fire created event
     * 4. (if enabled) create debug node for it
     * @method _scanLinks
     * @private
     */
    _scanLinks: function () {
        var self = this;
        var DOMNode = ReactDOM.findDOMNode(self);
        var foundElements = [];
        var reactI13n = self._getReactI13n();
        var scanTags = (self.props.scanLinks && self.props.scanLinks.tags) || DEFAULT_SCAN_TAGS;
        if (!DOMNode) {
            return;
        }
        self._subI13nComponents = [];

        // find all links
        scanTags.forEach(function scanElements(tagName) {
            var collections = DOMNode.getElementsByTagName(tagName);
            if (collections) {
                foundElements = foundElements.concat(convertToArray(collections));
            }
        });

        // for each link
        // 1. create a i13n node
        // 2. bind the click event
        // 3. fire created event
        // 4. (if enabled) create debug node for it
        foundElements.forEach(function registerFoundElement(element) {
            var I13nNode = reactI13n.getI13nNodeClass();
            var i13nNode = new I13nNode(self._i13nNode, {}, true, reactI13n.isViewportEnabled());
            i13nNode.setDOMNode(element);
            self._subI13nComponents.push({
                componentClickHandler: EventListener.listen(element, 'click', clickHandler.bind(Object.assign({}, self, {getI13nNode: function getI13nNodeForScannedNode() {
                    return i13nNode;
                }}))),
                i13nNode: i13nNode,
                debugDashboard: IS_DEBUG_MODE ? new DebugDashboard(i13nNode) : null
            });
            self._getReactI13n().execute('created', {i13nNode: i13nNode});
        });
    },

    /**
     * _subComponentsViewportDetection, will be executed by viewport mixin
     * @method _subComponentsViewportDetection
     * @private
     */
    _subComponentsViewportDetection: function () {
        var self = this;
        if (self._subI13nComponents && 0 < self._subI13nComponents.length) {
            self._subI13nComponents.forEach(function detectSubComponentViewport(subI13nComponent) {
                self._detectElement(subI13nComponent.i13nNode, function enterViewportCallback() {
                    subI13nComponent.i13nNode.setIsInViewport(true);
                    self._getReactI13n().execute('enterViewport', {
                        i13nNode: subI13nComponent.i13nNode
                    });
                });
            });
        }
    },

    /**
     * remove all click listeners and debug dashboards
     * @method _removeSubComponentsListenersAndDebugDashboards
     * @private
     */
    _removeSubComponentsListenersAndDebugDashboards: function () {
        var self = this;
        if (self._subI13nComponents && 0 < self._subI13nComponents.length) {
            self._subI13nComponents.forEach(function detectSubComponentViewport(subI13nComponent) {
                subI13nComponent.componentClickHandler.remove();
                if (subI13nComponent.debugDashboard) {
                    subI13nComponent.debugDashboard.destroy();
                }
            });
        }
    },

    /**
     * _enableViewportDetection
     * @method _enableViewportDetection
     * @private
     */
    _enableViewportDetection: function () {
        var self = this;
        self.onEnterViewport(self._handleEnterViewport);

        // for page init status, trigger page-init viewport detection to improve performance
        // otherwise for page update case, detect viewport directly
        if (!pageInitViewportDetected) {
            self._triggerPageInitViewportDetection();
        } else {
            // in case we have many i13n component mounted at one time, e.g., page switch
            // might cause large CPU usage,
            // delay viewport detection to the next tick.
            setImmediate(function delayDetectViewport() {
                self._detectViewport();
            });
        }
    },

    /**
     * _handleEnterViewport for react-viewport
     * @method _handleEnterViewport
     * @private
     */
    _handleEnterViewport: function () {
        this._i13nNode.setIsInViewport(true);
        this.unsubscribeViewportEvents();
        this.executeI13nEvent('enterViewport', {});
    },

    /**
     * trigger the page-init viewport detection
     * @method _triggerPageInitViewportDetection
     * @private
     */
    _triggerPageInitViewportDetection: function () {
        var self = this;
        // clear the timeout until latest node is mounted, then trigger the viewport detection
        clearTimeout(pageInitViewportDetectionTimeout);
        pageInitViewportDetectionTimeout = setTimeout(function executePageInitViewportDetection () {
            self._pageInitViewportDetection();
            pageInitViewportDetected = true;
        }, 500);
    },

    /**
     * page-init viewport detection
     * @method _pageInitViewportDetection
     * @private
     */
    _pageInitViewportDetection: function () {
        debug('page init viewport detection');
        var reactI13n = this._getReactI13n();
        var rootI13nNode = reactI13n.getRootI13nNode();
        // we don't have react component for root node, start from it's children
        rootI13nNode.getChildrenNodes().forEach(function detectRootChildrenViewport (childNode) {
            childNode.getReactComponent()._recursiveDetectViewport();
        });
    },

    /**
     * recursively detect viewport
     * @method _recursiveDetectViewport
     * @private
     */
    _recursiveDetectViewport: function () {
        var self = this;
        // detect viewport from the root, and skip all children's detection if it's not in the viewport
        self._detectViewport(null, null, function detectCallback () {
            if (self._i13nNode.isInViewport()) {
                self._i13nNode.getChildrenNodes().forEach(function detectChildrenViewport (childNode) {
                    var reactComponent = childNode.getReactComponent();
                    if (reactComponent) {
                        reactComponent._recursiveDetectViewport();
                    }
                });
            }
        });
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
     * isLeafNode
     * @method isLeafNode
     * @return {Boolean} if the node is a leaf link node
     */
    isLeafNode: function () {
        return this.props.isLeafNode || false;
    }
};

module.exports = I13nMixin;
