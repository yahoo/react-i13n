/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import I13nNode from '../../../src/libs/I13nNode';
import clickHandler from '../../../src/libs/clickHandler';

let mockClickEvent;
let mockComponent;

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

    mockClickEvent = {
      target: {},
      button: 0
    };
    mockComponent = {
      props: {
        href: 'foo'
      },
      _shouldFollowLink() {
        return this.props.follow;
      }
    };
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('should run click handler correctly', (done) => {
    const i13nNode = new I13nNode(null, {});
    mockClickEvent.preventDefault = jest.fn();
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
      expect(executedActions).toEqual(['preventDefault', 'assign']);
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
        expect(executedActions).toEqual(['preventDefault', 'submit']);
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
        expect(executedActions).toEqual(['preventDefault', 'submit']);
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
      expect(executedActions).toEqual(['preventDefault']);
      done();
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
      expect(executedActions).toEqual(['preventDefault']);
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
    mockComponent.props.follow = true;
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };
    mockComponent.executeI13nEvent = function (eventName, payload, callback) {
      callback();
    };
    document.location.assign = function () {
      executedActions.push('assign');
      expect(executedActions).toEqual(['preventDefault', 'assign']);
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
      expect(executedActions).toEqual([]);
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
      expect(executedActions).toEqual([]);
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
      expect(executedActions).toEqual([]);
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
      expect(executedActions).toEqual(['preventDefault']);
      expect(global.window.top.location.href).toEqual('foo');
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
      expect(executedActions).toEqual(['preventDefault']);
      expect(global.window.parent.location.href).toEqual('foo');
      done();
    };
    mockComponent.getI13nNode = function () {
      return i13nNode;
    };
    clickHandler.apply(mockComponent, [mockClickEvent]);
  });
});
