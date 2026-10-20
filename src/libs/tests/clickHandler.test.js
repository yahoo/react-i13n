/**
 * @jest-environment jsdom
 */
/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import I13nNode from '../../core/I13nNode';
import clickHandler from '../clickHandler';

let mockClickEvent;
let mockOptions;

describe('clickHandler', () => {
  const windowLocation = window.location;
  const windowParent = window.parent;

  beforeEach(() => {
    // http://fb.me/react-polyfills
    global.requestAnimationFrame = (callback) => {
      setTimeout(callback, 0);
    };

    delete window.location;
    delete window.parent;

    window.location = {
      assign: jest.fn()
    };
    window.parent = {
      top: {
        href: 'about:blank'
      },
      location: {
        href: 'about:blank'
      }
    };

    mockClickEvent = {
      currentTarget: {},
      button: 0,
      preventDefault: jest.fn()
    };

    mockOptions = {
      executeEvent: jest.fn(),
      i13nNode: new I13nNode(null, {}),
      props: {},
      shouldFollowLink: ({ follow }) => follow
    };
  });

  afterEach(() => {
    window.location = windowLocation;
    window.parent = windowParent;
  });

  it('should run click handler correctly', (done) => {
    mockOptions.executeEvent = (eventName) => {
      expect(eventName).toEqual('click');
      done();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should run click handler correctly if target is an a tag', (done) => {
    const executedActions = [];
    window.location.assign = () => {
      executedActions.push('assign');
      expect(executedActions).toEqual(['preventDefault', 'assign']);
      done();
    };

    mockClickEvent.currentTarget = {
      tagName: 'A',
      href: 'https://foobar.com'
    };
    mockClickEvent.preventDefault = () => {
      executedActions.push('preventDefault');
    };

    mockOptions.executeEvent = (a, b, callback) => { callback(); };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should run click handler correctly if target is an button', (done) => {
    const executedActions = [];

    mockClickEvent.currentTarget = {
      tagName: 'BUTTON',
      type: 'submit',
      form: {
        submit() {
          executedActions.push('submit');
          expect(executedActions).toEqual(['preventDefault', 'submit']);
          done();
        }
      }
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.executeEvent = function (eventName, payload, callback) {
      callback();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should run click handler correctly if target is input with submit', (done) => {
    const executedActions = [];
    mockClickEvent.currentTarget = {
      tagName: 'INPUT',
      type: 'submit',
      form: {
        submit() {
          executedActions.push('submit');
          expect(executedActions).toEqual(['preventDefault', 'submit']);
          done();
        }
      }
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.executeEvent = function (eventName, payload, callback) {
      callback();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should not follow it if follow is set to false', (done) => {
    const executedActions = [];
    mockClickEvent.currentTarget = {
      tagName: 'A',
      href: 'https://foobar.com'
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.props.follow = false;
    mockOptions.executeEvent = function () {
      expect(executedActions).toEqual(['preventDefault']);
      done();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should follow it while follow is set to true', (done) => {
    const executedActions = [];
    mockClickEvent.currentTarget = {
      tagName: 'A',
      href: 'https://foobar.com'
    };
    window.location.assign = function () {
      executedActions.push('assign');
      expect(executedActions).toEqual(['preventDefault', 'assign']);
      done();
    };

    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.props.follow = true;
    mockOptions.executeEvent = function (eventName, payload, callback) {
      callback();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should simply execute event without prevent default and redirection if the link is #', (done) => {
    const executedActions = [];
    mockClickEvent.currentTarget = {
      tagName: 'A'
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.props.href = '#';
    mockOptions.executeEvent = function () {
      expect(executedActions).toEqual([]);
      done();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should simply execute event without prevent default and redirection is a modified click', (done) => {
    const executedActions = [];
    mockClickEvent.currentTarget = {
      tagName: 'A'
    };
    mockClickEvent.metaKey = true;
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.props.href = '#';
    mockOptions.executeEvent = function () {
      expect(executedActions).toEqual([]);
      done();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should simply execute event without prevent default and redirection if props.target=_blank', (done) => {
    const executedActions = [];
    mockClickEvent.currentTarget = {
      tagName: 'SPAN'
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.props.target = '_blank';
    mockOptions.executeEvent = function () {
      expect(executedActions).toEqual([]);
      done();
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should execute event with prevent default and redirection if props.target=_top', (done) => {
    const executedActions = [];
    window.location.assign = function () {
      executedActions.push('assign');
    };

    mockClickEvent.currentTarget = {
      tagName: 'A',
      href: 'foo'
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.props.target = '_top';
    mockOptions.executeEvent = function (eventName, payload, callback) {
      callback();
      setTimeout(() => {
        expect(executedActions).toEqual(['preventDefault']);
        expect(global.window.top.location.href).toEqual('foo');
        done();
      }, 0);
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should execute event with prevent default and redirection if props.target=_parent', (done) => {
    const executedActions = [];
    window.location.assign = function () {
      executedActions.push('assign');
    };

    mockClickEvent.currentTarget = {
      tagName: 'A',
      href: 'foo'
    };
    mockClickEvent.preventDefault = function () {
      executedActions.push('preventDefault');
    };

    mockOptions.props.target = '_parent';
    mockOptions.executeEvent = function (eventName, payload, callback) {
      callback();
      setTimeout(() => {
        expect(executedActions).toEqual(['preventDefault']);
        expect(global.window.parent.location.href).toEqual('foo');
        done();
      }, 0);
    };

    clickHandler(mockClickEvent, mockOptions);
  });

  it('should submit the form with requestSubmit so submit handlers and validation run', (done) => {
    const button = {
      tagName: 'BUTTON',
      type: 'submit'
    };
    button.form = {
      requestSubmit(submitter) {
        expect(submitter).toBe(button);
        done();
      },
      submit() {
        done(new Error('form.submit() should not be called when requestSubmit exists'));
      }
    };
    mockClickEvent.currentTarget = button;
    mockOptions.executeEvent = (eventName, payload, callback) => { callback(); };

    clickHandler(mockClickEvent, mockOptions);
  });

  // https://github.com/yahoo/react-i13n/issues/569
  it('should not submit the form if a later handler calls preventDefault', (done) => {
    const submit = jest.fn();
    mockClickEvent.currentTarget = {
      tagName: 'BUTTON',
      type: 'submit',
      form: { submit }
    };
    mockOptions.executeEvent = (eventName, payload, callback) => { callback(); };

    clickHandler(mockClickEvent, mockOptions);
    // e.g. a React onClick, which runs after the native listener
    mockClickEvent.preventDefault();

    setTimeout(() => {
      expect(submit).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  // https://github.com/yahoo/react-i13n/issues/568
  it('should not redirect if a later handler calls preventDefault', (done) => {
    mockClickEvent.currentTarget = {
      tagName: 'A',
      href: 'https://foobar.com'
    };
    mockOptions.executeEvent = (eventName, payload, callback) => { callback(); };

    clickHandler(mockClickEvent, mockOptions);
    mockClickEvent.preventDefault();

    setTimeout(() => {
      expect(window.location.assign).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it('should not redirect if an earlier handler already called preventDefault', (done) => {
    mockClickEvent.currentTarget = {
      tagName: 'A',
      href: 'https://foobar.com'
    };
    mockClickEvent.defaultPrevented = true;
    mockOptions.executeEvent = (eventName, payload, callback) => {
      expect(eventName).toEqual('click');
      callback();
    };

    clickHandler(mockClickEvent, mockOptions);

    setTimeout(() => {
      expect(window.location.assign).not.toHaveBeenCalled();
      done();
    }, 0);
  });
});
