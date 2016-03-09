/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */
'use strict';

var expect = require('expect.js');
var jsdom = require('jsdom');
var clickHandler;
var React;
var mockData = {
};
var mockClickEvent;
var mockComponent;
var I13nNode = require('../../../../dist/libs/I13nNode');
describe('clickHandler', function () {
    beforeEach(function (done) {
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;

            React = require('react');
            clickHandler = require('../../../../dist/utils/clickHandler');
            mockClickEvent = {
                target: {
                },
                button: 0
            }
            mockComponent = {
                props: {
                    href: 'foo'
                },
                _shouldFollowLink: function() {
                    return (undefined !== this.props.followLink) ? this.props.followLink : this.props.follow;
                }
            };
            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    it('should run click handler correctly', function (done) {
        var i13nNode = new I13nNode(null, {});
        mockClickEvent.preventDefault = function () {};
        mockComponent.executeI13nEvent = function () {
            // simply done here to make sure it goes to the executeI13nEvent
            done();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should run click handler correctly if target is an a tag', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockClickEvent.target = {
            tagName: 'A'
        };
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        document.location.assign = function () {
            executedActions.push('assign');
            expect(executedActions).to.eql(['preventDefault', 'assign']);
            done();
        }
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            callback();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should run click handler correctly if target is an button', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockClickEvent.target = {
            tagName: 'BUTTON'
        };
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockClickEvent.target.form = {
            submit: function () {
                executedActions.push('submit');
                expect(executedActions).to.eql(['preventDefault', 'submit']);
                done();
            }
        }
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            callback();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should run click handler correctly if target is input with submit', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockClickEvent.target = {
            tagName: 'INPUT',
            type: 'submit'
        };
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockClickEvent.target.form = {
            submit: function () {
                executedActions.push('submit');
                expect(executedActions).to.eql(['preventDefault', 'submit']);
                done();
            }
        }
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            callback();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should not follow it if follow is set to false', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockComponent.props.follow = false;
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            expect(executedActions).to.eql(['preventDefault']);
            done();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should not follow it if followLink is set to false', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockComponent.props.followLink = false;
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            expect(executedActions).to.eql(['preventDefault']);
            done();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should follow it while follow is set to true', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockComponent.props.followLink = undefined;
        mockComponent.props.follow = true;
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            callback();
        };
        document.location.assign = function () {
            executedActions.push('assign');
            expect(executedActions).to.eql(['preventDefault', 'assign']);
            done();
        }
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should follow it while followLink is set to true', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockComponent.props.followLink = true;
        mockComponent.props.follow = false; // should not take follow
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            callback();
        };
        document.location.assign = function () {
            executedActions.push('assign');
            expect(executedActions).to.eql(['preventDefault', 'assign']);
            done();
        }
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should simply execute event without prevent default and redirection if the link is #', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockClickEvent.target = {
            tagName: 'A'
        };
        mockComponent.props.href = '#';
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            expect(executedActions).to.eql([]);
            done();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should simply execute event without prevent default and redirection is a modified click', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockClickEvent.target = {
            tagName: 'A'
        };
        mockClickEvent.metaKey = true;
        mockComponent.props.href = '#';
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            expect(executedActions).to.eql([]);
            done();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });

    it('should simply execute event without prevent default and redirection if props.target=_blank', function (done) {
        var i13nNode = new I13nNode(null, {});
        var executedActions = [];
        mockClickEvent.target = {
            tagName: 'SPAN'
        };
        mockComponent.props.target = '_blank';
        mockClickEvent.preventDefault = function () {
            executedActions.push('preventDefault');
        };
        mockComponent.executeI13nEvent = function (eventName, payload, callback) {
            expect(executedActions).to.eql([]);
            done();
        };
        mockComponent.getI13nNode = function () {
            return i13nNode;
        };
        clickHandler.apply(mockComponent, [mockClickEvent]);
    });
});
