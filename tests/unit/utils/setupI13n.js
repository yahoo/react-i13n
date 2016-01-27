/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */
'use strict';

var expect = require('expect.js');
var jsdom = require('jsdom');
var mockery = require('mockery');
var React;
var ReactDOM;
var setupI13n;
var mockData = {
    options: {},
    reactI13n: null,
    plugin: {
        name: 'test'
    }
};
var MockReactI13n = function (options) {
    this._plugins = [];
    this._options = options;
    mockData.reactI13n = this;
};
MockReactI13n.getInstance = function () {
    return mockData.reactI13n;
};
MockReactI13n.prototype.plug = function (plugin) {
    this._plugins.push(plugin);
};
MockReactI13n.prototype.createRootI13nNode = function () {
    this._rootI13nNode = {}
};

describe('setupI13n', function () {
    beforeEach(function (done) {
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;

            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });

            React = require('react');
            ReactDOM = require('react-dom');

            mockery.registerMock('../libs/ReactI13n', MockReactI13n);

            setupI13n = require('../../../../dist/utils/setupI13n');
            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    it('should generate a component with setupI13n', function (done) {
        var TestApp = React.createClass({
            displayName: 'TestApp',
            render: function() {
                return React.createElement('div');
            }
        });

        // check the initial state is correct after render
        var I13nTestApp = setupI13n(TestApp, mockData.options, [mockData.plugin]);
        expect(I13nTestApp.displayName).to.eql('RootI13nTestApp');
        var container = document.createElement('div');
        var component = ReactDOM.render(React.createElement(I13nTestApp, {}), container);
        expect(mockData.reactI13n._options).to.eql(mockData.options);
        expect(mockData.reactI13n._plugins[0]).to.eql(mockData.plugin);
        expect(mockData.reactI13n._rootI13nNode).to.be.an('object');
        done();
    });
    
    it('should generate a component with setupI13n and custom display name', function () {
        var TestApp = React.createClass({
            displayName: 'TestApp',
            render: function() {
                return React.createElement('div');
            }
        });

        // check the initial state is correct after render
        var I13nTestApp = setupI13n(TestApp, {displayName: 'CustomName'});
        expect(I13nTestApp.displayName).to.eql('CustomName');
    });

    it('should get i13n util functions via both props and context', function (done) {
        var TestApp = React.createClass({
            displayName: 'TestApp',
            contextTypes: {
                i13n: React.PropTypes.object
            },
            render: function() {
                expect(this.props.i13n).to.be.an('object');
                expect(this.props.i13n.executeEvent).to.be.a('function');
                expect(this.props.i13n.getI13nNode).to.be.a('function');
                expect(this.context.i13n).to.be.an('object');
                expect(this.context.i13n.executeEvent).to.be.a('function');
                expect(this.context.i13n.getI13nNode).to.be.a('function');
                done();
                return React.createElement('div');
            }
        });
        var I13nTestApp = setupI13n(TestApp, mockData.options, [mockData.plugin]);
        var container = document.createElement('div');
        var component = ReactDOM.render(React.createElement(I13nTestApp, {}), container);
    });
});
