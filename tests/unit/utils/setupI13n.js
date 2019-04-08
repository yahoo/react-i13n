/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */


import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import mockery from 'mockery';
import PropTypes from 'prop-types';

let createReactClass;
let React;
let ReactDOM;
let setupI13n;
const mockData = {
  options: {},
  reactI13n: null,
  plugin: {
    name: 'test'
  }
};
const MockReactI13n = function (options) {
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
  this._rootI13nNode = {};
};

describe('setupI13n', () => {
  beforeEach(() => {
    const jsdom = new JSDOM('<html><body></body></html>');
    global.window = jsdom.window;
    global.document = jsdom.window.document;
    global.navigator = jsdom.window.navigator;

    // http://fb.me/react-polyfills
    global.requestAnimationFrame = function (callback) {
      setTimeout(callback, 0);
    };

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    React = require('react');
    ReactDOM = require('react-dom');
    createReactClass = require('create-react-class');

    mockery.registerMock('../libs/ReactI13n', MockReactI13n);

    setupI13n = require('../../../dist/utils/setupI13n').default;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.navigator;
    mockery.disable();
  });

  it('should generate a component with setupI13n', (done) => {
    const TestApp = createReactClass({
      displayName: 'TestApp',
      render() {
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestApp = setupI13n(TestApp, mockData.options, [mockData.plugin]);
    expect(I13nTestApp.displayName).to.eql('RootI13nTestApp');
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestApp, {}), container);
    expect(mockData.reactI13n._options).to.eql(mockData.options);
    expect(mockData.reactI13n._plugins[0]).to.eql(mockData.plugin);
    expect(mockData.reactI13n._rootI13nNode).to.be.an('object');
    done();
  });

  it('should generate a component with setupI13n and custom display name', () => {
    const TestApp = createReactClass({
      displayName: 'TestApp',
      render() {
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestApp = setupI13n(TestApp, { displayName: 'CustomName' });
    expect(I13nTestApp.displayName).to.eql('CustomName');
  });

  it('should get i13n util functions via both props and context', (done) => {
    const TestApp = createReactClass({
      displayName: 'TestApp',
      contextTypes: {
        i13n: PropTypes.object
      },
      render() {
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
    const I13nTestApp = setupI13n(TestApp, [mockData.plugin]);
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestApp), container);
  });

  it('should not get i13n util functions via props if skipUtilFunctionsByProps=true', (done) => {
    const TestApp = createReactClass({
      displayName: 'TestApp',
      contextTypes: {
        i13n: PropTypes.object
      },
      render() {
        expect(this.props.i13n).to.equal(undefined);
        done();
        return React.createElement('div');
      }
    });
    const I13nTestApp = setupI13n(TestApp, { skipUtilFunctionsByProps: true }, [mockData.plugin]);
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestApp), container);
  });
});
