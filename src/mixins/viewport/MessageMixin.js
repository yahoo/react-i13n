/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var eventEmitter = require('./EventEmitter');

var MsgMixin = {
    subscribe: function (eventName, callback) {
        if (!this.subscriptions) {
            this.subscriptions = {};
        }
        eventEmitter.addListener(eventName, callback);
        this.subscriptions[eventName] = {
            remove: function () {
                eventEmitter.removeListener(eventName, callback);
            }
        };
    },
    unsubscribe: function (eventName) {
        if (!this.subscriptions) {
            this.subscriptions = {};
        }
        if (this.subscriptions[eventName]) {
            this.subscriptions[eventName].remove();
            delete this.subscriptions[eventName];
        }
    }
};

module.exports = MsgMixin;
