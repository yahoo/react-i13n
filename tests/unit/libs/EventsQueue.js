/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe, it, beforeEach, afterEach */

'use strict';

var expect = require('expect.js');
var EventsQueue = require('../../../../dist/libs/EventsQueue');

describe('EventsQueue', function () {
    it('should be created correctly', function () {
        var testPlugin = {
            name: 'test',
            eventHandlers: {}
        };
        var eventsQueue = new EventsQueue(testPlugin);
        expect(eventsQueue._plugin).to.eql(testPlugin);
        expect(eventsQueue._pendingCallbacks).to.eql([]);
        expect(eventsQueue._pendingEventsCount).to.eql(0);
    });
    
    it('should execute event correctly', function (done) {
        var testPlugin = {
            name: 'test',
            eventHandlers: {
                click: function (payload, callback) {
                    expect(payload).to.be.an('object');
                    callback();
                }
            }
        };
        var eventsQueue = new EventsQueue(testPlugin);
        eventsQueue.executeEvent('click', {}, function eventCallback() {
            // after events are executed, the pending evnets should be empty
            expect(eventsQueue._pendingCallbacks.length).to.eql(0);
            expect(eventsQueue._pendingEventsCount).to.eql(0);
            done();
        });
    });
    
    it('should execute event correctly event if there is fatal error in the handler', function (done) {
        var testPlugin = {
            name: 'test',
            eventHandlers: {
                click: function (payload, callback) {
                    payload.a.b.c = null; // should be fatal error
                    callback();
                }
            }
        };
        var eventsQueue = new EventsQueue(testPlugin);
        
        // the reject function will be executed
        eventsQueue.executeEvent('click', {}, null, function eventCallback() {
            // after events are executed, the pending evnets should be empty
            expect(eventsQueue._pendingCallbacks.length).to.eql(0);
            expect(eventsQueue._pendingEventsCount).to.eql(0);
            done();
        });
    });

    it('should execute event correctly event if no handler defined', function (done) {
        var testPlugin = {
            name: 'test',
            eventHandlers: {
                click: function (payload, callback) {
                    callback();
                }
            }
        };
        var eventsQueue = new EventsQueue(testPlugin);
        eventsQueue.executeEvent('pageview', {}, function eventCallback() {
            // after events are executed, the pending evnets should be empty
            expect(eventsQueue._pendingCallbacks.length).to.eql(0);
            expect(eventsQueue._pendingEventsCount).to.eql(0);
            done();
        });
    });
    
    it('should execute event correctly and all events can be executed completely', function (done) {
        var testPlugin = {
            name: 'test',
            eventHandlers: {
                click: function (payload, callback) {
                    expect(payload).to.be.an('object');
                    callback();
                },
                updated: function (payload, callback) {
                    setTimeout(function pendingEvent() {
                        // the pending events should be executed either
                        expect(payload).to.be.an('object');
                        callback();
                    }, 200);
                }
            }
        };
        var eventsQueue = new EventsQueue(testPlugin);
        eventsQueue.executeEvent('updated', {}, function eventCallback() {
            // after events are executed, the pending evnets should be empty
            expect(eventsQueue._pendingCallbacks.length).to.eql(1); // should have callback for click not executed yet
            expect(eventsQueue._pendingEventsCount).to.eql(0);
            done();
        });
        eventsQueue.executeEvent('click', {}, function eventCallback() {
            // after events are executed, the pending evnets should be empty
            expect(eventsQueue._pendingCallbacks.length).to.eql(0);
            expect(eventsQueue._pendingEventsCount).to.eql(0);
        });
    });
});
