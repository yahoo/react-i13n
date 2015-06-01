/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('EventsQueue');

/**
 * EventsQueue
 * Manager a event queue, all the event callback would be pending until the events are all executed completely, 
 * e.g., we don't want to fire click event and redirect user before some other events are finished
 *
 * @class EventsQueue
 * @param {Object} plugin the plugin object
 * @constructor
 */
var EventsQueue = function EventsQueue (plugin) {
    var self = this;
    self._plugin = plugin;
    self._pendingCallbacks = [];
    self._pendingEventsCount = 0;
};

/**
 * Check if there's no pending events, if yes execute callback and execute all pending callbacks
 * @method _callbackAndCheckQueue
 * @param {Function} callback callback function
 * @private
 */
EventsQueue.prototype._callbackAndCheckQueue = function callbackAndCheckQueue (callback) {
    var self = this;
    self._pendingEventsCount--;
    // if there's no pending events, execute callback and pending-callbacks
    if (0 === self._pendingEventsCount) {
        callback && callback();
        while (0 !== self._pendingCallbacks.length) {
            var pendingCallback = self._pendingCallbacks.pop();
            pendingCallback && pendingCallback();
        }
    } else {
        self._pendingCallbacks.push(callback);
    }
};

/**
 * The proxy function of event firing
 * @method executeEvent
 * @param {String} eventName event name
 * @param {Object} payload payload
 * @param {Function} resolve promise resolve callback
 * @param {Function} reject promise reject callback
 */
EventsQueue.prototype.executeEvent = function executeEvent (eventName, payload, resolve, reject) {
    var self = this;
    var eventLog = {
        pluginName: self._plugin.name,
        eventName: eventName,
        payload: payload
    };
    self._pendingEventsCount++;
    try {
        if (self._plugin && self._plugin.eventHandlers && self._plugin.eventHandlers[eventName]) {
            self._plugin.eventHandlers[eventName].apply(self._plugin, [payload, function eventCallback() {
                self._callbackAndCheckQueue(resolve);
            }]);
        } else {
            debug('Handler ' + eventName + ' is not found: ' + self._plugin.name, eventLog);
            self._callbackAndCheckQueue(resolve);
        }
    } catch (e) {
        debug('Handler ' + eventName + ' throws error: ' + self._plugin.name, e);
        self._callbackAndCheckQueue(reject);
    }
};

module.exports = EventsQueue;
