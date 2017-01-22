/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */
'use strict';

var expect = require('expect.js');
var jsdom = require('jsdom');
var DebugDashboard;
var I13nNode = require('../../../../dist/libs/I13nNode');
describe('clickHandler', function () {
    beforeEach(function (done) {
        jsdom.env('<html><body><div id="testnode"></div></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;
            DebugDashboard = require('../../../../dist/libs/DebugDashboard');
            done();
        });
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
