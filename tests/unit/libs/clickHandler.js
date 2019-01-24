/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */


import expect from 'expect.js';

let clickHandler;
let React;
const mockData = {};
let mockClickEvent;
let mockComponent;
const I13nNode = require('../../../src/libs/I13nNode');

describe('clickHandler', () => {
  beforeEach(() => {
    global.window = {
      parent: {
        location: {
          href: 'about:blank'
        }
      },
      top: {
        location: {
          href: 'about:blank'
        }
      }
    };
    global.document = {
      location: {
        assign(href) {
          this.href = href;
        },
        href: 'about:blank'
      }
    };

    React = require('react');
    clickHandler = require('../../../src/libs/clickHandler').default;
    mockClickEvent = {
      target: {},
      button: 0
    };
    mockComponent = {
      props: {
        href: 'foo'
      },
      _shouldFollowLink() {
        return undefined !== this.props.followLink ? this.props.followLink : this.props.follow;
      }
    };
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('should run click handler correctly', (done) => {
    const i13nNode = new I13nNode(null, {});
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

  it('should run click handler correctly if target is an a tag', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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
    };
    mockComponent.executeI13nEvent = function (eventName, payload, callback) {
      callback();
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });

  it('should run click handler correctly if target is an button', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
    mockClickEvent.target = {
      tagName: 'BUTTON'
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };
    mockClickEvent.target.form = {
      submit() {
        executedActions.push('submit');
        expect(executedActions).to.eql(['preventDefault', 'submit']);
        done();
      }
    };
    mockComponent.executeI13nEvent = function (eventName, payload, callback) {
      callback();
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });

  it('should run click handler correctly if target is input with submit', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
    mockClickEvent.target = {
      tagName: 'INPUT',
      type: 'submit'
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };
    mockClickEvent.target.form = {
      submit() {
        executedActions.push('submit');
        expect(executedActions).to.eql(['preventDefault', 'submit']);
        done();
      }
    };
    mockComponent.executeI13nEvent = function (eventName, payload, callback) {
      callback();
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });

  it('should not follow it if follow is set to false', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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

  it('should not follow it if followLink is set to false', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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

  it('should follow it while follow is set to true', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });

  it('should follow it while followLink is set to true', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });

  it('should simply execute event without prevent default and redirection if the link is #', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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

  it('should simply execute event without prevent default and redirection is a modified click', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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

  it('should simply execute event without prevent default and redirection if props.target=_blank', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
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

  it('should execute event with prevent default and redirection if props.target=_top', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
    mockClickEvent.target = {
      tagName: 'A'
    };
    mockComponent.props.target = '_top';
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };
    document.location.assign = function () {
      executedActions.push('assign');
    };
    mockComponent.executeI13nEvent = function (eventName, payload, callback) {
      callback();
      expect(executedActions).to.eql(['preventDefault']);
      expect(global.window.top.location.href).to.eql('foo');
      done();
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });

  it('should execute event with prevent default and redirection if props.target=_parent', (done) => {
    const i13nNode = new I13nNode(null, {});
    const executedActions = [];
    mockClickEvent.target = {
      tagName: 'A'
    };
    mockComponent.props.target = '_parent';
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };
    document.location.assign = function () {
      executedActions.push('assign');
    };
    mockComponent.executeI13nEvent = function (eventName, payload, callback) {
      callback();
      expect(executedActions).to.eql(['preventDefault']);
      expect(global.window.parent.location.href).to.eql('foo');
      done();
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });
});
