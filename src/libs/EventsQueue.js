/**
 * Copyright 2020 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const debug = require('debug')('EventsQueue');

/**
 * EventsQueue
 * Manager a event queue, all the event callback would be pending until the events are all executed completely,
 * e.g., we don't want to fire click event and redirect user before some other events are finished
 *
 * @class EventsQueue
 * @param {Object} plugin the plugin object
 * @constructor
 */
class EventsQueue {
  constructor(plugin) {
    this._plugin = plugin;
    this._pendingCallbacks = [];
    this._pendingEventsCount = 0;
  }

  /**
   * Check if there's no pending events, if yes execute callback and execute all pending callbacks
   * @method _callbackAndCheckQueue
   * @param {Function} callback callback function
   * @private
   */
  _callbackAndCheckQueue(callback) {
    this._pendingEventsCount--;
    // if there's no pending events, execute callback and pending-callbacks
    if (this._pendingEventsCount === 0) {
      callback && callback();
      while (this._pendingCallbacks.length !== 0) {
        const pendingCallback = this._pendingCallbacks.pop();
        pendingCallback && pendingCallback();
      }
    } else {
      this._pendingCallbacks.push(callback);
    }
  }

  /**
   * The proxy function of event firing
   * @method executeEvent
   * @param {String} eventName event name
   * @param {Object} payload payload
   * @param {Function} resolve promise resolve callback
   * @param {Function} reject promise reject callback
   */

  executeEvent(eventName, payload, resolve, reject) {
    const eventLog = {
      pluginName: this._plugin.name,
      eventName,
      payload
    };
    this._pendingEventsCount++;
    try {
      if (this._plugin && this._plugin.eventHandlers && this._plugin.eventHandlers[eventName]) {
        this._plugin.eventHandlers[eventName].apply(this._plugin, [
          payload,
          () => {
            this._callbackAndCheckQueue(resolve);
          }
        ]);
      } else {
        debug(`Handler ${eventName} is not found: ${this._plugin.name}`, eventLog);
        this._callbackAndCheckQueue(resolve);
      }
    } catch (e) {
      debug(`Handler ${eventName} throws error: ${this._plugin.name}`, e);
      this._callbackAndCheckQueue(reject);
    }
  }
}

export default EventsQueue;
