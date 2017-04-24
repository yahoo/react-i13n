/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */
'use strict';

var expect = require('expect.js');
var JSDOM = require('jsdom').JSDOM;
var DebugDashboard;
var I13nNode = require('../../../src/libs/I13nNode');
describe('clickHandler', function () {
    beforeEach(function () {
        var jsdom = new JSDOM('<html><body><div id="testnode"></div></body></html>');
        global.window = jsdom.window;
        global.document = jsdom.window.document;
        global.navigator = jsdom.window.navigator;
        DebugDashboard = require('../../../src/libs/DebugDashboard');
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    it('should able to generate debug dashboard correctly', function () {
        var i13nNode = new I13nNode(null, {});
        var domNode = document.getElementById('testnode');
        i13nNode.setDOMNode(domNode);
        var debugDashboard = new DebugDashboard(i13nNode);
        expect(document.getElementById('i13n-debug-0')).to.be.an('object');
        debugDashboard.destroy();
    });
});
