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
var ReactTestUtils;
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

            React = require('react/addons');
            ReactTestUtils = require('react/lib/ReactTestUtils');
            
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
        var component = React.render(React.createElement(I13nTestApp, {}), container);
        expect(mockData.reactI13n._options).to.eql(mockData.options);
        expect(mockData.reactI13n._plugins[0]).to.eql(mockData.plugin);
        expect(mockData.reactI13n._rootI13nNode).to.be.an('object');
        done();
    });
});
