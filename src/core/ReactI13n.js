/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { IS_CLIENT, ENVIRONMENT } from '../utils/variables';
import EventsQueue from '../libs/EventsQueue';
import I13nNode from './I13nNode';

import isUndefined from '../utils/isUndefined';
import warnAndPrintTrace from '../utils/warnAndPrintTrace';

const debugLib = require('debug');
const debug = debugLib('ReactI13n');

const DEFAULT_HANDLER_TIMEOUT = 1000;

// export the debug lib in client side
if (IS_CLIENT) {
  window.debugLib = debugLib;
}

let _reactI13nInstance = null;

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
class ReactI13n {
  constructor(options = {}) {
    debug('init', options);
    this._eventsQueues = {};
    this._plugins = {};
    this._rootModelData = options.rootModelData || {};

    this._handlerTimeout = options.handlerTimeout || DEFAULT_HANDLER_TIMEOUT;
    this._i13nNodeClass = typeof options.i13nNodeClass === 'function' ? options.i13nNodeClass : I13nNode;
    this._isViewportEnabled = options.isViewportEnabled || false;
    this._scrollableContainerId = options.scrollableContainerId;
    this._i13nInstance = null;
  }

  get i13nInstance() {
    return this._i13nInstance;
  }

  set i13nInstance(instance) {
    _reactI13nInstance = instance;
    this._i13nInstance = instance;
  }

  /**
   * Create root node and set to the global object
   * @method createRootI13nNode
   */
  createRootI13nNode() {
    const I13nNodeClass = this.getI13nNodeClass();
    this._rootI13nNode = new I13nNodeClass(null, this._rootModelData, false);
    if (IS_CLIENT) {
      this._rootI13nNode.setDOMNode(document.body);
    }
    return this._rootI13nNode;
  }

  /**
   * Execute handlers asynchronously
   * @method execute
   * @param {String} eventName
   * @param {Object} payload payload object
   * @param {Function} callback callback function when all handlers are executed
   * @async
   */
  execute = (eventName, payload, callback) => {
    payload = Object.assign({}, payload);
    payload.env = ENVIRONMENT;
    payload.i13nNode = payload.i13nNode || this.getRootI13nNode();
    const promiseHandlers = this.getEventHandlers(eventName, payload);

    if (promiseHandlers && promiseHandlers.length > 0) {
      let handlerTimeout;
      promiseHandlers.push(
        new Promise((resolve) => {
          handlerTimeout = setTimeout(() => {
            debug(`handler timeout in ${this._handlerTimeout}ms.`);
            resolve();
          }, this._handlerTimeout);
        })
      );
      // promised execute all handlers if plugins and then call callback function
      Promise
        .race(promiseHandlers)
        .then(
          () => {
            clearTimeout(handlerTimeout);
            callback?.();
          },
          (e) => {
            clearTimeout(handlerTimeout);
            debug('execute event failed', e);
            callback?.();
          }
        );
    } else {
      // if there's no handlers, execute callback directly
      callback?.();
    }
  };

  /**
   * Setup plugins
   * @method plug
   * @param {Object} plugin the plugin object
   */
  plug(plugin) {
    if (!plugin) {
      return;
    }
    debug('setup plugin', plugin);

    this._plugins[plugin.name] = plugin;
    this._eventsQueues[plugin.name] = new EventsQueue(plugin);
  }

  /**
   * Get handlers from all plugin by event name
   * @method getEventHandlers
   * @param {String} eventName event name
   * @param {Object} payload payload object
   * @return {Array} the promise handlers
   */
  getEventHandlers = (eventName, payload) => {
    const promiseHandlers = [];
    if (this._plugins) {
      Object.entries(this._plugins).forEach(([pluginName, plugin]) => {
        const eventsQueue = this._eventsQueues[pluginName];
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

  getI13nNodeClass() {
    return this._i13nNodeClass;
  }

  /**
   * Get isViewportEnabled value
   * @method isViewportEnabled
   * @return {Object} isViewportEnabled value
   */

  isViewportEnabled() {
    return this._isViewportEnabled;
  }

  /**
   * Get scrollableContainerId value
   * @method getScrollableContainerId
   * @return {String} scrollableContainerId value
   */

  getScrollableContainerId() {
    return this._scrollableContainerId;
  }

  /**
   * Get scrollable container DOM node
   * @method getScrollableContainerDOMNode
   * @return {Object} scrollable container DOM node.  This will be undefined if no
   *     scrollableContainerId was set, or null if the element was not found in the DOM.
   */

  getScrollableContainerDOMNode() {
    if (this._scrollableContainerId) {
      return document?.getElementById(this._scrollableContainerId);
    }
  }

  /**
   * Get root i13n node
   * @method getRootI13nNode
   * @return {Object} root react i13n node
   */
  getRootI13nNode() {
    return this._rootI13nNode;
  }

  /**
   * Update ReactI13n options
   * @method updateOptions
   * @param {Object} options
   */
  updateOptions(options = {}) {
    debug('updated', options);
    this._i13nNodeClass = typeof options.i13nNodeClass === 'function' ? options.i13nNodeClass : this._i13nNodeClass;
    this._isViewportEnabled = options.isViewportEnabled ?? this._isViewportEnabled;
    this._rootModelData = options.rootModelData ?? this._rootModelData;
    this._handlerTimeout = options.handlerTimeout ?? this._handlerTimeout;
    this._scrollableContainerId = options.scrollableContainerId ?? this._scrollableContainerId;
  }
}

export const getInstance = () => {
  if (IS_CLIENT) {
    return _reactI13nInstance;
  }
  warnAndPrintTrace(
    'ReactI13n instance is not avaialble on server side with ReactI13n.getInstance, '
      + 'please use this.props.i13n or this.context.i13n to access ReactI13n utils'
  );
  return null;
};
export default ReactI13n;
