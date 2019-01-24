/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, global, document */

const debugLib = require('debug');

const debug = debugLib('ReactI13n');
const EventsQueue = require('./EventsQueue');
const I13nNode = require('./I13nNode');

const DEFAULT_HANDLER_TIMEOUT = 1000;
const ENVIRONMENT = typeof window !== 'undefined' ? 'client' : 'server';

// export the debug lib in client side
if (ENVIRONMENT === 'client') {
  window.debugLib = debugLib;
}

/**
 * ReactI13n Library to build a tree for instrumentation
 * @class ReactI13n
 * @param {Object} options options object
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.rootModelData model data of root i13n node
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @param {String} options.scrollableContainerId id of the scrollable element that your components
 *     reside within.  Normally, you won't need to provide a value for this.  This is only to
 *     support viewport checking when your components are contained within a scrollable element.
 *     Currently, only elements that fill the viewport are supported.
 * @constructor
 */
const ReactI13n = function ReactI13n(options) {
  debug('init', options);
  options = options || {};
  this._i13nNodeClass = typeof options.i13nNodeClass === 'function' ? options.i13nNodeClass : I13nNode;
  this._plugins = {};
  this._eventsQueues = {};
  this._isViewportEnabled = options.isViewportEnabled || false;
  this._rootModelData = options.rootModelData || {};
  this._handlerTimeout = options.handlerTimeout || DEFAULT_HANDLER_TIMEOUT;
  this._scrollableContainerId = options.scrollableContainerId || undefined;
};

/**
 * Get ReactI13n Instance
 * @method getInstance
 * @return the ReactI13n instance
 * @static
 */
ReactI13n.getInstance = function getInstance() {
  if (ENVIRONMENT === 'client') {
    return window._reactI13nInstance;
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'ReactI13n instance is not avaialble on server side with ReactI13n.getInstance, '
        + 'please use this.props.i13n or this.context.i13n to access ReactI13n utils'
    );
  }
};

/**
 * Create root node and set to the global object
 * @method createRootI13nNode
 */
ReactI13n.prototype.createRootI13nNode = function createRootI13nNode() {
  const I13nNodeClass = this.getI13nNodeClass();
  this._rootI13nNode = new I13nNodeClass(null, this._rootModelData, false);
  if (ENVIRONMENT === 'client') {
    this._rootI13nNode.setDOMNode(document.body);
  }
  return this._rootI13nNode;
};

/**
 * Execute handlers asynchronously
 * @method execute
 * @param {String} eventName
 * @param {Object} payload payload object
 * @param {Function} callback callback function when all handlers are executed
 * @async
 */
ReactI13n.prototype.execute = function execute(eventName, payload, callback) {
  const self = this;
  payload = Object.assign({}, payload);
  payload.env = ENVIRONMENT;
  payload.i13nNode = payload.i13nNode || this.getRootI13nNode();
  const promiseHandlers = this.getEventHandlers(eventName, payload);
  if (promiseHandlers && promiseHandlers.length > 0) {
    let handlerTimeout;
    promiseHandlers.push(
      new Promise((resolve, reject) => {
        handlerTimeout = setTimeout(() => {
          debug(`handler timeout in ${self._handlerTimeout}ms.`);
          resolve();
        }, self._handlerTimeout);
      })
    );
    // promised execute all handlers if plugins and then call callback function
    Promise.race(promiseHandlers).then(
      () => {
        clearTimeout(handlerTimeout);
        callback && callback();
      },
      (e) => {
        clearTimeout(handlerTimeout);
        debug('execute event failed', e);
        callback && callback();
      }
    );
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
ReactI13n.prototype.plug = function plug(plugin) {
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
ReactI13n.prototype.getEventHandlers = function getEventHandlers(eventName, payload) {
  const self = this;
  const promiseHandlers = [];
  if (self._plugins) {
    Object.keys(self._plugins).forEach((pluginName) => {
      const plugin = self._plugins[pluginName];
      const eventsQueue = self._eventsQueues[pluginName];
      const eventHandler = plugin && plugin.eventHandlers && plugin.eventHandlers[eventName];
      if (eventHandler) {
        promiseHandlers.push(
          new Promise((resolve, reject) => {
            eventsQueue.executeEvent(eventName, payload, resolve, reject);
          })
        );
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
ReactI13n.prototype.getI13nNodeClass = function getI13nNodeClass() {
  return this._i13nNodeClass;
};

/**
 * Get isViewportEnabled value
 * @method isViewportEnabled
 * @return {Object} isViewportEnabled value
 */
ReactI13n.prototype.isViewportEnabled = function isViewportEnabled() {
  return this._isViewportEnabled;
};

/**
 * Get scrollableContainerId value
 * @method getScrollableContainerId
 * @return {String} scrollableContainerId value
 */
ReactI13n.prototype.getScrollableContainerId = function getScrollableContainerId() {
  return this._scrollableContainerId;
};

/**
 * Get scrollable container DOM node
 * @method getScrollableContainerDOMNode
 * @return {Object} scrollable container DOM node.  This will be undefined if no
 *     scrollableContainerId was set, or null if the element was not found in the DOM.
 */
ReactI13n.prototype.getScrollableContainerDOMNode = function getScrollableContainerDOMNode() {
  if (this._scrollableContainerId) {
    return document && document.getElementById(this._scrollableContainerId);
  }
};

/**
 * Get root i13n node
 * @method getRootI13nNode
 * @return {Object} root react i13n node
 */
ReactI13n.prototype.getRootI13nNode = function getRootI13nNode() {
  return this._rootI13nNode;
};

/**
 * Update ReactI13n options
 * @method updateOptions
 * @param {Object} options
 */
ReactI13n.prototype.updateOptions = function updateOptions(options) {
  debug('updated', options);
  options = options || {};
  this._i13nNodeClass = typeof options.i13nNodeClass === 'function' ? options.i13nNodeClass : this._i13nNodeClass;
  this._isViewportEnabled = undefined !== options.isViewportEnabled ? options.isViewportEnabled : this._isViewportEnabled;
  this._rootModelData = options.rootModelData ? options.rootModelData : this._rootModelData;
  this._handlerTimeout = options.handlerTimeout ? options.handlerTimeout : this._handlerTimeout;
  this._scrollableContainerId = typeof options.scrollableContainerId === 'undefined'
    ? this._scrollableContainerId
    : options.scrollableContainerId;
};

module.exports = ReactI13n;
