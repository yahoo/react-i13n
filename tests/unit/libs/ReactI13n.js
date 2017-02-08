/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe, it, beforeEach, afterEach */

'use strict';

var expect = require('expect.js');
var ReactI13n = require('../../../src/libs/ReactI13n');

describe('ReactI13n', function () {

    it('should be created correctly', function () {
        var reactI13n = new ReactI13n({
            isViewportEnabled: true
        });
        expect(reactI13n.isViewportEnabled()).to.eql(true);
    });
    
    it('should be able to update options', function () {
        var reactI13n = new ReactI13n({
            isViewportEnabled: true
        });
        expect(reactI13n.isViewportEnabled()).to.eql(true);

        reactI13n.updateOptions({
            isViewportEnabled: false
        })
        expect(reactI13n.isViewportEnabled()).to.eql(false);
    });
    
    it('should be able to greate root i13n node', function () {
        var rootModelData = {
            foo: 'bar'
        };
        var mockReactI13nClass = function () {
        };
        mockReactI13nClass.prototype.getMergedModel = function () {
            return rootModelData;
        }
        var reactI13n = new ReactI13n({
            rootModelData: rootModelData,
            i13nNodeClass: mockReactI13nClass
        });
        reactI13n.createRootI13nNode();
        expect(reactI13n.getRootI13nNode().getMergedModel()).to.eql(rootModelData);
    });

    it('should be able to setup plugin and execute event', function (done) {
        var mockPlugin1 = {
            name: 'test1',
            eventHandlers: {
                click: function (payload, callback) {
                    expect(payload).to.eql({});
                    callback();
                }
            }
        };
        
        var mockPlugin2 = {
            name: 'test2',
            eventHandlers: {
                click: function (payload, callback) {
                    expect(payload).to.eql({});
                    callback();
                }
            }
        };
        var reactI13n = new ReactI13n({});
        reactI13n.plug(mockPlugin1);
        reactI13n.plug(mockPlugin2);
        // two plugin should be executed correctly then call the custom callback
        reactI13n.execute('click', {}, function () {
            expect(true).to.eql(true);
            done();
        });
    });
    
    it('should be able to execute event without modifying payload', function (done) {
        var mockPlugin1 = {
            name: 'test1',
            eventHandlers: {
                click: function (payload, callback) {
                    expect(payload).to.eql({});
                    callback();
                }
            }
        };

        var payload = {
            foo: 'bar'
        };
        
        var reactI13n = new ReactI13n({});
        reactI13n.plug(mockPlugin1);
        reactI13n.execute('click', payload, function () {
            // should only have one attribute as 'foo', which means payload is not modified inside reactI13n.execute
            expect(payload).to.eql({foo: 'bar'});
            done();
        });
    });
    
    it('should have a global timeout if event handler does not finish in time', function (done) {
        var mockPlugin1 = {
            name: 'test1',
            eventHandlers: {
                click: function (payload, callback) {
                    // do nothing, without callback, simulate if event handler does not execute correctly or timeout
                }
            }
        };
        
        var reactI13n = new ReactI13n({});
        reactI13n.plug(mockPlugin1);
        // two plugin should be executed correctly then call the custom callback
        reactI13n.execute('click', {}, function () {
            // should still have callback due to the global timeout 
            expect(true).to.eql(true);
            done();
        });
    });

    it('should be able to set a scrollableContainerId', function () {
        var reactI13n = new ReactI13n({
            scrollableContainerId: 'scrollable-test'
        });

        expect(reactI13n.getScrollableContainerId()).to.eql('scrollable-test');
    });

    it('should have an undefined scrollableContainerDOMNode if the scrollableContainerId is undefined', function () {
        var reactI13n = new ReactI13n({
            isViewportEnabled: true
        });

        expect(reactI13n.getScrollableContainerDOMNode()).to.eql(undefined);
    });
});
