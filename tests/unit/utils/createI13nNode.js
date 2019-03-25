/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */


/* All the functionalities are tested with this higher order component */
import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import mockery from 'mockery';
import PropTypes from 'prop-types';

let I13nNode;
let rootI13nNode = null;
let React;
let ReactDOM;
let createReactClass;
let createI13nNode;
const mockData = {
  options: {},
  reactI13n: {},
  plugin: {
    name: 'test'
  },
  isViewportEnabled: false
};
const MockReactI13n = {};
let mockSubscribeHandler = null;
let subscribers = [];
const mockSubscribe = {
  subscribe(eventName, handler) {
    subscribers.push({
      eventName
    });
    mockSubscribeHandler = handler;
    return {
      unsubscribe() {}
    };
  },
  listen(target, event) {
    return {
      remove() {}
    };
  }
};
let mockClickHandler = function () {};
const oldWarn = console.warn;
const oldTrace = console.trace;

function findProps(elem) {
  try {
    return elem[
      Object.keys(elem).find(key => (
        key.indexOf('__reactInternalInstance') === 0
          || key.indexOf('_reactInternalComponent') === 0
      ))
    ].memoizedProps;
  } catch (e) {}
}

describe('createI13nNode', () => {
  beforeEach(() => {
    const jsdom = new JSDOM('<html><body></body></html>');
    global.window = jsdom.window;
    global.document = jsdom.window.document;
    global.navigator = jsdom.window.navigator;
    global.location = window.location;
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
    mockery.registerMock('subscribe-ui-event', mockSubscribe);
    mockery.registerMock('../libs/clickHandler', mockClickHandler);

    createI13nNode = require('../../../src/utils/createI13nNode').default;
    I13nNode = require('../../../src/libs/I13nNode').default;

    rootI13nNode = new I13nNode(null, {});
    mockData.reactI13n = {
      getI13nNodeClass() {
        return I13nNode;
      },
      getRootI13nNode() {
        return rootI13nNode;
      },
      isViewportEnabled() {
        return mockData.isViewportEnabled;
      }
    };
    global.window._reactI13nInstance = mockData.reactI13n;
    subscribers = [];
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.navigator;
    mockery.disable();
    console.warn = oldWarn;
    console.trace = oldTrace;
  });

  it('should generate a component with createI13nNode', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    mockData.reactI13n.execute = function (eventName) {
      // should get a created event
      expect(eventName).to.eql('created');
      done();
    };
    expect(I13nTestComponent.displayName).to.eql('I13nTestComponent');
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { i13nModel: { sec: 'foo' } }),
      container
    );
    expect(rootI13nNode.getChildrenNodes()[0].getModel()).to.eql({ sec: 'foo' });
  });

  it('should generate a component with createI13nNode and custome name', () => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent, {}, { displayName: 'CustomeName' });
    expect(I13nTestComponent.displayName).to.eql('CustomeName');
  });

  it('should generate a component with createI13nNode and BC for users passing data as model', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    mockData.reactI13n.execute = function (eventName) {
      // should get a created event
      expect(eventName).to.eql('created');
      done();
    };
    expect(I13nTestComponent.displayName).to.eql('I13nTestComponent');
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { model: { sec: 'foo' } }),
      container
    );
    expect(rootI13nNode.getChildrenNodes()[0].getModel()).to.eql({ sec: 'foo' });
  });

  it('should generate a component with createI13nNode with statics', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      statics: {
        foo: 'bar'
      },
      render() {
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    expect(I13nTestComponent.foo).to.eql('bar');
    done();
  });

  it("should handle the case if reactI13n doesn't inititalized", () => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement('div');
      }
    });
    const I13nTestComponent = createI13nNode(TestComponent);
    window._reactI13nInstance = null;
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestComponent, {}), container);
    expect(component).to.be.an('object');
  });

  it('should handle the case of unmount', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement('div');
      }
    });
    const I13nTestComponent = createI13nNode(TestComponent);
    mockData.reactI13n.execute = function (eventName) {
      // should get a created event
      expect(eventName).to.eql('created');
      done();
    };
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestComponent, {}), container);
    expect(rootI13nNode.getChildrenNodes()[0]).to.be.an('object');
    ReactDOM.unmountComponentAtNode(container); // unmount should remove the child from root
    expect(rootI13nNode.getChildrenNodes()[0]).to.eql(undefined);
  });

  it('should be able to bind click handler', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement('div');
      }
    });
    mockClickHandler = function (e) {};
    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    mockData.reactI13n.execute = function (eventName) {
      // should get a created event
      expect(eventName).to.eql('created');
      done();
    };
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { bindClickEvent: true }),
      container
    );
    expect(component).to.be.an('object');
  });

  it('should handle scan the links inside if autoScanLinks is enable', (done) => {
    mockData.isViewportEnabled = false;
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement(
          'div',
          null,
          React.createElement('a', { href: '/foo' }, 'foo'),
          React.createElement('button', null, 'bar')
        );
      }
    });
    const I13nTestComponent = createI13nNode(TestComponent);
    const container = document.createElement('div');
    let executeCount = 0;
    // should get three created events
    mockData.reactI13n.execute = function (eventName, payload) {
      expect(eventName).to.eql('created');
      executeCount += 1;
      if (executeCount === 2) {
        expect(payload.i13nNode.getText()).to.eql('foo');
      }
      if (executeCount === 3) {
        expect(payload.i13nNode.getText()).to.eql('bar');
        done();
      }
    };
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { scanLinks: { enable: true } }),
      container
    );
  });

  it('should able to use props.getI13nNode to get the nearest i13n node', () => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        // should able to get the I13nNode we just create by createI13nNode
        // check the i13nModel here, should equal to what we pass into
        expect(this.props.i13n.getI13nNode().getModel()).to.eql({ foo: 'bar' });
        return React.createElement('div');
      }
    });
    mockData.reactI13n.execute = function (eventName) {};
    mockData.isViewportEnabled = false;
    const I13nTestComponent = createI13nNode(TestComponent, {});
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { i13nModel: { foo: 'bar' } }),
      container
    );
  });

  it('should able to use props.executeEvent to execute i13n event', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        this.props.i13n.executeEvent('foo', {});
        return React.createElement('div');
      }
    });
    let executeCount = 0;
    mockData.reactI13n.execute = function (eventName) {
      executeCount += 1;
      if (executeCount === 1) {
        expect(eventName).to.eql('foo');
        done();
      }
    };
    mockData.isViewportEnabled = false;
    const I13nTestComponent = createI13nNode(TestComponent, {});
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { i13nModel: { foo: 'bar' } }),
      container
    );
  });

  it('should update the i13n model when component updates', () => {
    const i13nModel = { sec: 'foo' };
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      contextTypes: {
        i13n: PropTypes.object
      },
      render() {
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    mockData.reactI13n.execute = function (eventName) {
      // should get a created event
      expect(eventName).to.eql('created');
    };
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { i13nModel }),
      container
    );
    i13nModel.sec = 'bar';
    component.componentWillUpdate({ i13nModel }, null);
    expect(component._i13nNode.getModel()).to.eql(i13nModel);
  });

  it('should handle the case if we enable viewport checking', (done) => {
    const TestSubComponent = createReactClass({
      displayName: 'TestSubComponent',
      render() {
        return React.createElement('div');
      }
    });
    const I13nTestSubComponent = createI13nNode(TestSubComponent);
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement(I13nTestSubComponent);
      }
    });
    const I13nTestComponent = createI13nNode(TestComponent);
    mockData.isViewportEnabled = true;
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName, payload) {
      executedArray.push(eventName);
    };
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestComponent, {}), container);
    // we wait 500ms and batch the viewport detection, wait 1000ms here util it's finished
    setTimeout(() => {
      expect(executedArray[0]).to.be.equal('created');
      expect(executedArray[1]).to.be.equal('created');
      expect(executedArray[2]).to.be.equal('enterViewport');
      expect(executedArray[3]).to.be.equal('enterViewport');
      done();
    }, 1000);
  });

  it('should still subscribe listeners if parent is not in viewport', (done) => {
    mockData.isViewportEnabled = true;
    window.innerHeight = -30; // we can't change the rect of the nodes, fake innerHeight to fail the viewport detection

    const TestSubComponent = createReactClass({
      displayName: 'TestSubComponent',
      render() {
        return React.createElement('div', {}, null);
      }
    });
    const I13nTestSubComponent = createI13nNode(TestSubComponent);

    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement(I13nTestSubComponent, {});
      }
    });
    const I13nTestComponent = createI13nNode(TestComponent);
    const container = document.createElement('div');
    // should get three created events
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName) {
      executedArray.push(eventName);
    };
    const component = ReactDOM.render(React.createElement(I13nTestComponent, {}), container);
    // we wait 500ms and batch the viewport detection, wait 1000ms here util it's finished
    setTimeout(() => {
      expect(executedArray.length).to.be.equal(2);
      expect(executedArray[0]).to.be.equal('created');
      expect(executedArray[1]).to.be.equal('created');
      expect(executedArray[2]).to.be.equal(undefined); // no enterViewport should happen here
      expect(subscribers.length).to.be.equal(2); // should still get 2 subscribers for viewport
      expect(subscribers[0].eventName).to.be.equal('scrollEnd');
      expect(subscribers[1].eventName).to.be.equal('scrollEnd');

      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 1000);
  });

  it('should handle the case if we enable viewport checking with subComponents generated by scanLinks', (done) => {
    mockData.isViewportEnabled = true;
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement(
          'div',
          {},
          React.createElement('a', { href: '/foo' }, 'foo'),
          React.createElement('button', null, 'bar')
        );
      }
    });
    const I13nTestComponent = createI13nNode(TestComponent);
    const container = document.createElement('div');
    // should get three created events
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName) {
      executedArray.push(eventName);
    };
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { scanLinks: { enable: true } }),
      container
    );
    // we wait 500ms and batch the viewport detection, wait 1000ms here util it's finished
    setTimeout(() => {
      expect(executedArray[0]).to.be.equal('created');
      expect(executedArray[1]).to.be.equal('created');
      expect(executedArray[2]).to.be.equal('created');
      expect(executedArray[3]).to.be.equal('enterViewport');
      expect(executedArray[4]).to.be.equal('enterViewport');
      expect(executedArray[5]).to.be.equal('enterViewport');
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 1000);
  });

  it("should stop scanned nodes' viewport detection if parent is not in viewport", (done) => {
    mockData.isViewportEnabled = true;
    window.innerHeight = -30; // we can't change the rect of the nodes, fake innerHeight to fail the viewport detection
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      render() {
        return React.createElement(
          'div',
          {},
          React.createElement('a', { href: '/foo' }, 'foo'),
          React.createElement('button', null, 'bar')
        );
      }
    });
    const I13nTestComponent = createI13nNode(TestComponent);
    const container = document.createElement('div');
    // should get three created events
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName) {
      executedArray.push(eventName);
    };
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { scanLinks: { enable: true } }),
      container
    );
    // we wait 500ms and batch the viewport detection, wait 1000ms here util it's finished
    setTimeout(() => {
      expect(executedArray[0]).to.be.equal('created');
      expect(executedArray[1]).to.be.equal('created');
      expect(executedArray[2]).to.be.equal('created');
      expect(executedArray[3]).to.be.equal(undefined); // no enterViewport should happen here
      expect(subscribers.length).to.be.equal(1);
      ReactDOM.unmountComponentAtNode(container);
      done();
    }, 1000);
  });

  it('should not cause error if we pass a undefined to createI13nNode', (done) => {
    console.warn = function (msg) {
      expect(msg).to.equal('You are passing a null component into createI13nNode');
      done();
    };
    console.trace = function () {
      // no-op
    };
    const I13nTestComponent = createI13nNode(undefined);
    expect(I13nTestComponent).to.eql(undefined);
  });

  it('should not get any i13n related props on wrapped component if skipUtilFunctionsByProps=true', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
      contextTypes: {
        i13n: PropTypes.object
      },
      render() {
        expect(this.props.i13n).to.equal(undefined);
        expect(this.props.i13nModal).to.equal(undefined);
        expect(this.props.follow).to.equal(undefined);
        expect(this.props.isLeafNode).to.equal(undefined);
        expect(this.props.bindClickEvent).to.equal(undefined);
        expect(this.props.scanLinks).to.equal(undefined);
        done();
        return React.createElement('div');
      }
    });

    const I13nTestComponent = createI13nNode(TestComponent, {}, { skipUtilFunctionsByProps: true });
    mockData.reactI13n.execute = function (eventName) {};
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { i13nModel: { sec: 'foo' } }),
      container
    );
  });

  it('should get i13n util functions via both props and context', (done) => {
    const TestComponent = createReactClass({
      displayName: 'TestComponent',
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
        return React.createElement('div');
      }
    });

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent, {});
    mockData.reactI13n.execute = function (eventName) {
      // should get a created event
      console.log(eventName);
      expect(eventName).to.eql('created');
      done();
    };
    expect(I13nTestComponent.displayName).to.eql('I13nTestComponent');
    const container = document.createElement('div');
    const component = ReactDOM.render(
      React.createElement(I13nTestComponent, { i13nModel: { sec: 'foo' } }),
      container
    );
  });

  it('should expose the wrapped component as refs.wrappedElement', () => {
    const TestComponent = createReactClass({
      render() {
        return React.createElement('div');
      }
    });
    const I13nTestComponent = createI13nNode(
      TestComponent,
      {},
      { refToWrappedComponent: 'wrappedElement' }
    );
    mockData.reactI13n.execute = function () {};
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestComponent), container);
    expect(component.refs.wrappedElement).to.be.a(TestComponent);
  });

  it('should not pass i13n props to string components', () => {
    const props = {
      i13nModel: { sec: 'foo' },
      href: '#/foobar'
    };
    console.warn = function (msg) {
      expect(msg).to.equal(
        'props.followLink support is deprecated, please use props.follow instead.'
      );
    };
    const I13nTestComponent = createI13nNode(
      'a',
      {
        follow: true,
        followLink: true,
        isLeafNode: true,
        bindClickEvent: true,
        scanLinks: { enable: true }
      },
      {
        refToWrappedComponent: 'wrappedElement'
      }
    );
    mockData.reactI13n.execute = function () {};
    const container = document.createElement('div');
    const component = ReactDOM.render(React.createElement(I13nTestComponent, props), container);
    expect(findProps(component.refs.wrappedElement)).to.eql({
      href: '#/foobar',
      children: undefined
    });
  });
});
