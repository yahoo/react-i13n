/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */


import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import I13nNode from '../../../dist/libs/I13nNode';

let DebugDashboard;

describe('clickHandler', () => {
  beforeEach(() => {
    const jsdom = new JSDOM('<html><body><div id="testnode"></div></body></html>');
    global.window = jsdom.window;
    global.document = jsdom.window.document;
    global.navigator = jsdom.window.navigator;
    // http://fb.me/react-polyfills
    global.requestAnimationFrame = function (callback) {
      setTimeout(callback, 0);
    };
    DebugDashboard = require('../../../dist/libs/DebugDashboard');
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.navigator;
  });

  it('should able to generate debug dashboard correctly', () => {
    const i13nNode = new I13nNode(null, {});
    const domNode = document.getElementById('testnode');
    i13nNode.setDOMNode(domNode);
    const debugDashboard = new DebugDashboard(i13nNode);
    expect(document.getElementById('i13n-debug-0')).to.be.an('object');
    debugDashboard.destroy();
  });
});
