/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe, it, beforeEach, afterEach */

'use strict';

var expect = require('expect.js');
var ReactI13n = require('../../../../dist/libs/ReactI13n');

describe('ReactI13n', function () {

    it('should be created correctly', function () {
        var reactI13n = new ReactI13n({
            isViewportEnabled: true
        });
        expect(ReactI13n.getInstance()).to.eql(reactI13n); // static function should be able to get the instance we created
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

});
