/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global document, require */
/*jslint nomen: true*/
/*
A wrapper around the Page Visibility API:

https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
*/
'use strict';
var eventEmitter = require('./EventEmitter');

(function () {
    var handleEvent;
    var sendEvent;
    var visibilityData;
    var getVisibilityProps;

    getVisibilityProps = function () {
        var prefixes = ['webkit', 'moz', 'ms', 'o'];
        var prefixesLen = prefixes.length;
        var i;
        if (document.hidden) {
            return {
                hiddenName: 'hidden',
                eventName: 'visibilitychange'
            };
        }
        for (i = 0; i < prefixesLen; i += 1) {
            if ((prefixes[i] + 'Hidden') in document) {
                return {
                    hiddenName: prefixes[i] + 'Hidden',
                    eventName: prefixes[i] + 'visibilitychange'
                };
            }
        }
        return null;
    };

    sendEvent = function (eventName, data) {
        eventEmitter.emit(eventName, data);
    };

    handleEvent = function () {
        sendEvent('visibilitychange', document[visibilityData.hiddenName]);
    };

    if (typeof document !== 'undefined') {
        visibilityData = getVisibilityProps();
        if (!visibilityData) {
            // This is for testing purposes of components that include the lib
            // In test env visivility data is null;
            return;
        }
        if (document.addEventListener) {
            document.addEventListener(visibilityData.eventName, handleEvent);
        } else if (document.attachEvent) {
            document.attachEvent(visibilityData.eventName, handleEvent);
        }
    }
}());
