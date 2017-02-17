/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals location */
'use strict';

require('setimmediate');

var DebugDashboard = require('./DebugDashboard');
var I13nNode = require('./I13nNode');
var React = require('react');
var ReactDOM = require('react-dom');
var ReactI13n = require('./ReactI13n');
var ViewportDetector = require('./ViewportDetector');
var clickHandler = require('./clickHandler');
var debug = require('debug')('I13nComponent');
var listen = require('subscribe-ui-event/dist/lib/listen');
var subscribe = require('subscribe-ui-event/dist/subscribe');

var IS_DEBUG_MODE = (function isDebugMode () {
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
})();
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

var staticSpecs = {
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
        }),
        viewport: React.PropTypes.shape({
            margins: React.PropTypes.shape({
                usePercent: React.PropTypes.bool,
                top: React.PropTypes.number,
                bottom: React.PropTypes.number
            })
        })
    },
    
    contextTypes: {
        i13n: React.PropTypes.shape({
            executeEvent: React.PropTypes.func,
            getI13nNode: React.PropTypes.func,
            parentI13nNode: React.PropTypes.object,
            _reactI13nInstance: React.PropTypes.object
        })
    },
    
    childContextTypes: {
        i13n: React.PropTypes.shape({
            executeEvent: React.PropTypes.func,
            getI13nNode: React.PropTypes.func,
            parentI13nNode: React.PropTypes.object,
            _reactI13nInstance: React.PropTypes.object
        })
    }
};

var prototypeSpecs = {
    /**
     * getChildContext
     * @method getChildContext
     */
    getChildContext: function () {
        var self = this;
        // create a wrapper function and use apply here
        // to make sure this works with/without autobind, without generating warning msg
        return {
            i13n: {
                executeEvent: function executeEvent () {
                    return self.executeI13nEvent.apply(self, arguments);
                },
                getI13nNode: function getI13nNode () {
                    return self.getI13nNode.apply(self, arguments);
                },
                parentI13nNode: this._i13nNode,
                _reactI13nInstance: this._getReactI13n()
            }
        };
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
        var reactI13n = self._getReactI13n();
        if (!reactI13n) {
            return;
        }

        // bind the click event for i13n component if it's enabled
        if (self.props.bindClickEvent) {
            self.clickEventListener = listen(ReactDOM.findDOMNode(self), 'click', clickHandler.bind(self));
        }

        var domNode = ReactDOM.findDOMNode(self);
        self._i13nNode.setDOMNode(domNode);

        // enable viewport checking if enabled
        if (reactI13n.isViewportEnabled()) {
            self._viewportDetector = new ViewportDetector(domNode, self._getViewportOptions(), function onEnterViewport() {
                self._handleEnterViewport();
            });
            if (pageInitViewportDetected) {
                self._viewportDetector.init();
            } else {
                self._triggerPageInitViewportDetection();
            }
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
            this._viewportDetector.unsubscribeAll();
        }

        // remove debug dashboard
        if (IS_DEBUG_MODE) {
            this._debugDashboard && this._debugDashboard.destroy();
        }

        this._removeSubComponentsListenersAndDebugDashboards();
    },
    
    /**
     * execute the i13n event
     * @method executeI13nEvent
     * @param {String} eventName event name
     * @param {Object} payload payload object
     * @param {Function} callback function
     * @async
     */
    executeI13nEvent: function (eventName, payload, callback) {
        var reactI13nInstance = this._getReactI13n();
        var errorMessage = '';
        payload = payload || {};
        payload.i13nNode = payload.i13nNode || this.getI13nNode();
        if (reactI13nInstance) {
            reactI13nInstance.execute(eventName, payload, callback);
        } else {
            /* istanbul ignore next */
            if ('production' !== process.env.NODE_ENV) {
                errorMessage = 'ReactI13n instance is not found, ' + 
                    'please make sure you have setupI13n on the root component. ';
                if (typeof window === 'undefined') {
                    errorMessage += 'On server side, ' + 
                        'you can only execute the i13n event on the components under setupI13n, ' + 
                        'please make sure you are calling executeI13nEvent correctly';
                }
                console && console.warn && console.warn(errorMessage);
                console && console.trace && console.trace();
            }
            callback && callback();
        }
    },

    /**
     * Get the nearest i13n node from the parent, default will go to the rootI13nNode
     * @method getI13nNode
     * @return {Object} i13n node
     */
    getI13nNode: function () {
        return this._i13nNode || this._getParentI13nNode();
    },

    _getViewportOptions: function () {
        var options = {};
        var margins = this.props.viewport && this.props.viewport.margins;
        if (margins) {
            options.margins = margins;
        }
        var reactI13n = this._getReactI13n();
        if (reactI13n.getScrollableContainerDOMNode) {
            var domNode = reactI13n.getScrollableContainerDOMNode();
            if (domNode) {
                options.target = domNode;
            }
        }
        return options;
    },

    /**
     * get React I13n instance
     * @method _getReactI13n
     * @private
     * @return {Object} react i13n instance
     */
    _getReactI13n: function () {
        var globalReactI13n;
        if (typeof window !== 'undefined') {
            globalReactI13n = window._reactI13nInstance;
        }
        return this._reactI13nInstance || 
            (this.context && this.context.i13n && this.context.i13n._reactI13nInstance) ||
            globalReactI13n;
    },

    /**
     * _getParentI13nNode, defualt will go to the rootI13nNode
     * @method _getParentI13nNode
     * @private
     * @return {Object} parent i13n node
     */
    _getParentI13nNode: function () {
        var reactI13n = this._getReactI13n();
        var context = this.context;
        return (context && context.i13n && context.i13n.parentI13nNode) || 
            (reactI13n && reactI13n.getRootI13nNode());
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
            var subThis = {
                props: {
                    href: element.href,
                    follow: true
                },
                getI13nNode: function getI13nNodeForScannedNode() {
                    return i13nNode;
                }
            };
            subThis._shouldFollowLink = self._shouldFollowLink.bind(subThis),
            subThis.executeI13nEvent = self.executeI13nEvent.bind(self);
            self._subI13nComponents.push({
                componentClickListener: listen(element, 'click', clickHandler.bind(subThis)),
                debugDashboard: IS_DEBUG_MODE ? new DebugDashboard(i13nNode) : null,
                domElement: element,
                i13nNode: i13nNode
            });
            self._getReactI13n().execute('created', {i13nNode: i13nNode});
        });
    },

    /**
     * _shouldFollowLink, provide a hook to check followLink.
     * It check if component implement its own shouldFollowLink() method, 
     * otherwise return props.followLink or props.follow
     * @method _shouldFollowLink
     * @private
     */
    _shouldFollowLink: function () {
        if (undefined !== this.shouldFollowLink) {
            return this.shouldFollowLink(this.props);
        }
        return (undefined !== this.props.followLink) ? this.props.followLink : this.props.follow;
    },

    /**
     * _subComponentsViewportDetection, will be executed by viewport mixin
     * @method _subComponentsViewportDetection
     * @private
     */
    _subComponentsViewportDetection: function () {
        var self = this;
        if (self._subI13nComponents && 0 < self._subI13nComponents.length) {
            self._subI13nComponents.forEach(function forEachSubI13nComponent(subI13nComponent) {
                subI13nComponent.viewportDetector = new ViewportDetector(subI13nComponent.domElement, 
                    self._getViewportOptions(), function onSubComponentEnterViewport() {
                    subI13nComponent.i13nNode.setIsInViewport(true);
                    self._getReactI13n().execute('enterViewport', {
                        i13nNode: subI13nComponent.i13nNode
                    });
                });
                subI13nComponent.viewportDetector.init();
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
            self._subI13nComponents.forEach(function forEachSubI13nComponent(subI13nComponent) {
                subI13nComponent.componentClickListener.remove();
                if (subI13nComponent.viewportDetector) {
                    subI13nComponent.viewportDetector.unsubscribeAll();
                }
                if (subI13nComponent.debugDashboard) {
                    subI13nComponent.debugDashboard.destroy();
                }
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
        this.executeI13nEvent('enterViewport', {});
        this._subComponentsViewportDetection();
    },

    /**
     * Debouncely trigger the page-init viewport detection
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
        var rootI13nNode = reactI13n && reactI13n.getRootI13nNode && reactI13n.getRootI13nNode();
        if (!rootI13nNode) {
            // return if rootI13nNode not found in any case
            // known issue for unit testing, this happens when the next test already happens
            return;
        }
        // we don't have react component for root node, start from it's children
        rootI13nNode.getChildrenNodes().forEach(function detectRootChildrenViewport (childNode) {
            childNode.getReactComponent().recursiveDetectViewport(true);
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
        var parentI13nNode = self._getParentI13nNode();
        var reactI13n = self._getReactI13n();
        var I13nNodeClass = (reactI13n && reactI13n.getI13nNodeClass()) || I13nNode;
        // TODO @kaesonho remove BC for model
        self._i13nNode = new I13nNodeClass(
            parentI13nNode,
            self.props.i13nModel || self.props.model,
            self.isLeafNode(),
            reactI13n && reactI13n.isViewportEnabled());
    },
    
    /**
     * recursively detect viewport
     * @method recursiveDetectViewport
     * @params {Boolean} parentInViewport
     */
    recursiveDetectViewport: function (parentInViewport) {
        var self = this;
        self._viewportDetector.init(!parentInViewport);
        self._i13nNode.getChildrenNodes().forEach(function detectChildrenViewport (childNode) {
            var reactComponent = childNode.getReactComponent();
            if (reactComponent) {
                reactComponent.recursiveDetectViewport(self._viewportDetector.isEnteredViewport());
            }
        });
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

/**
 * Pick prototype and static specs for components, return all if specs is not set
 * @method pickSpecs
 * @param (Object) specs picking specs
 * @param (Object) specs.prototype picking prototype specs
 * @param (Object) specs.static picking static specs
 * @returns picked specs
 */
var pickSpecs = function pickSpecs (specs) {
    specs = specs || {};
    var picked = {
        prototype: {},
        static: {}
    };

    if (!specs.prototype) {
        picked.prototype = prototypeSpecs;
    } else {
        specs.prototype.forEach(function (spec) {
            picked.prototype[spec] = prototypeSpecs[spec];
        });
    }

    if (!specs.static) {
        picked.static = staticSpecs;
    } else {
        specs.static.forEach(function (spec) {
            picked.static[spec] = staticSpecs[spec];
        });
    }

    return picked;
}

module.exports = {
    pickSpecs: pickSpecs
};
