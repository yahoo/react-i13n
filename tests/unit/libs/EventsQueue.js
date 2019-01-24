/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe, it, beforeEach, afterEach */


const expect = require('expect.js');
const EventsQueue = require('../../../src/libs/EventsQueue');

describe('EventsQueue', () => {
  it('should be created correctly', () => {
    const testPlugin = {
      name: 'test',
      eventHandlers: {}
    };
    const eventsQueue = new EventsQueue(testPlugin);
    expect(eventsQueue._plugin).to.eql(testPlugin);
    expect(eventsQueue._pendingCallbacks).to.eql([]);
    expect(eventsQueue._pendingEventsCount).to.eql(0);
  });

  it('should execute event correctly', (done) => {
    const testPlugin = {
      name: 'test',
      eventHandlers: {
        click(payload, callback) {
          expect(payload).to.be.an('object');
          callback();
        }
      }
    };
    const eventsQueue = new EventsQueue(testPlugin);
    eventsQueue.executeEvent('click', {}, () => {
      // after events are executed, the pending evnets should be empty
      expect(eventsQueue._pendingCallbacks.length).to.eql(0);
      expect(eventsQueue._pendingEventsCount).to.eql(0);
      done();
    });
  });

  it('should execute event correctly event if there is fatal error in the handler', (done) => {
    const testPlugin = {
      name: 'test',
      eventHandlers: {
        click(payload, callback) {
          payload.a.b.c = null; // should be fatal error
          callback();
        }
      }
    };
    const eventsQueue = new EventsQueue(testPlugin);

    // the reject function will be executed
    eventsQueue.executeEvent('click', {}, null, () => {
      // after events are executed, the pending evnets should be empty
      expect(eventsQueue._pendingCallbacks.length).to.eql(0);
      expect(eventsQueue._pendingEventsCount).to.eql(0);
      done();
    });
  });

  it('should execute event correctly event if no handler defined', (done) => {
    const testPlugin = {
      name: 'test',
      eventHandlers: {
        click(payload, callback) {
          callback();
        }
      }
    };
    const eventsQueue = new EventsQueue(testPlugin);
    eventsQueue.executeEvent('pageview', {}, () => {
      // after events are executed, the pending evnets should be empty
      expect(eventsQueue._pendingCallbacks.length).to.eql(0);
      expect(eventsQueue._pendingEventsCount).to.eql(0);
      done();
    });
  });

  it('should execute event correctly and all events can be executed completely', (done) => {
    const testPlugin = {
      name: 'test',
      eventHandlers: {
        click(payload, callback) {
          expect(payload).to.be.an('object');
          callback();
        },
        updated(payload, callback) {
          setTimeout(() => {
            // the pending events should be executed either
            expect(payload).to.be.an('object');
            callback();
          }, 200);
        }
      }
    };
    const eventsQueue = new EventsQueue(testPlugin);
    eventsQueue.executeEvent('updated', {}, () => {
      // after events are executed, the pending evnets should be empty
      expect(eventsQueue._pendingCallbacks.length).to.eql(1); // should have callback for click not executed yet
      expect(eventsQueue._pendingEventsCount).to.eql(0);
      done();
    });
    eventsQueue.executeEvent('click', {}, () => {
      // after events are executed, the pending evnets should be empty
      expect(eventsQueue._pendingCallbacks.length).to.eql(0);
      expect(eventsQueue._pendingEventsCount).to.eql(0);
    });
  });
});
