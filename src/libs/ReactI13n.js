/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, global, document */
'use strict';

var debugLib = require('debug');
var debug = debugLib('ReactI13n');
var EventsQueue = require('./EventsQueue');
var I13nNode = require('./I13nNode');
var DEFAULT_HANDLER_TIMEOUT = 1000;
var GLOBAL_OBJECT = ('client' === ENVIRONMENT) ? window : global;
var ENVIRONMENT = (typeof window !== 'undefined') ? 'client' : 'server';

// export the debug lib in client side
if ('client' === ENVIRONMENT) {
    window.debugLib = debugLib;
}

/**
 * ReactI13n Library to build a tree for instrumentation
 * @class ReactI13n
 * @param {Object} options options object
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.rootModelData model data of root i13n node
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @constructor
 */
var ReactI13n = function ReactI13n (options) {
    debug('init', options);
    options = options || {};
    this._i13nNodeClass = 'function' === typeof options.i13nNodeClass ? options.i13nNodeClass : I13nNode;

    this._plugins = {};
    this._eventsQueues = {};
    this._isViewportEnabled = options.isViewportEnabled || false;
    this._rootModelData = options.rootModelData || {};
    this._handlerTimeout = options.handlerTimeout || DEFAULT_HANDLER_TIMEOUT;

    // set itself to the global object so that we can get it anywhere by the static function getInstance
    GLOBAL_OBJECT.reactI13n = this;
};

/**
 * Get ReactI13n Instance
 * @method getInstance
 * @return the ReactI13n instance
 * @static
 */
ReactI13n.getInstance = function getInstance () {
    return GLOBAL_OBJECT.reactI13n;
};

/**
 * Create root node and set to the global object
 * @method createRootI13nNode
 */
ReactI13n.prototype.createRootI13nNode = function createRootI13nNode () {
    var I13nNodeClass = this.getI13nNodeClass();
    GLOBAL_OBJECT.rootI13nNode = new I13nNodeClass(null, this._rootModelData, false);
    if ('client' === ENVIRONMENT) {
        GLOBAL_OBJECT.rootI13nNode.setDOMNode(document.body);
    }
    return GLOBAL_OBJECT.rootI13nNode;
};

/**
 * Execute handlers asynchronously
 * @method execute
 * @param {String} eventName
 * @param {Object} payload payload object
 * @param {Function} callback callback function when all handlers are executed
 * @async
 */
ReactI13n.prototype.execute = function execute (eventName, payload, callback) {
    var self = this;
    payload = Object.assign({}, payload);
    payload.env = ENVIRONMENT;
    payload.i13nNode = payload.i13nNode || this.getRootI13nNode();
    var promiseHandlers = this.getEventHandlers(eventName, payload);
    if (promiseHandlers && promiseHandlers.length > 0) {
        var handlerTimeout;
        promiseHandlers.push(new Promise(function handlerTimeoutPromise(resolve, reject) {
            handlerTimeout = setTimeout(function handlerTimeout () {
                debug('handler timeout in ' + self._handlerTimeout + 'ms.');
                resolve();
            }, self._handlerTimeout);
        }));
        // promised execute all handlers if plugins and then call callback function
        Promise.race(promiseHandlers).then(function promiseSuccess () {
            clearTimeout(handlerTimeout);
            callback && callback();
        }, function promiseFailed (e) {
            clearTimeout(handlerTimeout);
            debug('execute event failed', e);
            callback && callback();
        });
    } else {
        // if there's no handlers, execute callback directly
        callback && callback();
    }
};

/**
 * Setup plugins
 * @method plug
 * @param {Object} plugin the plugin object
 */
ReactI13n.prototype.plug = function plug (plugin) {
    if (!plugin) {
        return;
    }
    this._plugins[plugin.name] = plugin;
    this._eventsQueues[plugin.name] = new EventsQueue(plugin);
    debug('setup plugin', plugin);
};

/**
 * Get handlers from all plugin by event name
 * @method getEventHandlers
 * @param {String} eventName event name
 * @param {Object} payload payload object
 * @return {Array} the promise handlers
 */
ReactI13n.prototype.getEventHandlers = function getEventHandlers (eventName, payload) {
    var self = this;
    var promiseHandlers = [];
    if (self._plugins) {
        Object.keys(self._plugins).forEach(function getEventHandler (pluginName) {
            var plugin = self._plugins[pluginName];
            var eventsQueue = self._eventsQueues[pluginName];
            var eventHandler = plugin && plugin.eventHandlers && plugin.eventHandlers[eventName];
            if (eventHandler) {
                promiseHandlers.push(new Promise(function executeEventHandler(resolve, reject) {
                    eventsQueue.executeEvent(eventName, payload, resolve, reject);
                }));
            }
        });
    }
    return promiseHandlers;
};

/**
 * Get I13n node class
 * @method getI13nNodeClass
 * @return {Object} I13nNode class
 */
ReactI13n.prototype.getI13nNodeClass = function getI13nNodeClass () {
    return this._i13nNodeClass;
};

/**
 * Get isViewportEnabled value
 * @method isViewportEnabled
 * @return {Object} isViewportEnabled value
 */
ReactI13n.prototype.isViewportEnabled = function isViewportEnabled () {
    return this._isViewportEnabled;
};

/**
 * Get root i13n node
 * @method getRootI13nNode
 * @return {Object} root react i13n node
 */
ReactI13n.prototype.getRootI13nNode = function getRootI13nNode () {
    return GLOBAL_OBJECT.rootI13nNode;
};

/**
 * Update ReactI13n options
 * @method updateOptions
 * @param {Object} options
 */
ReactI13n.prototype.updateOptions = function updateOptions (options) {
    debug('updated', options);
    options = options || {};
    this._i13nNodeClass = 'function' === typeof options.i13nNodeClass ? options.i13nNodeClass : this._i13nNodeClass;
    this._isViewportEnabled = (undefined !== options.isViewportEnabled) ?
        options.isViewportEnabled : this._isViewportEnabled;
    this._rootModelData = options.rootModelData ? options.rootModelData : this._rootModelData;
    this._handlerTimeout = options.handlerTimeout ? options.handlerTimeout : this._handlerTimeout;
};

module.exports = ReactI13n;
