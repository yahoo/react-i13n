/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/* All the functionalities are tested with this higher order component */

import React, { useContext } from 'react';
import { render, fireEvent } from '@testing-library/react';
import PropTypes from 'prop-types';

import createI13nNode from '../createI13nNode';
import I13nContext from '../../components/core/I13nContext';
import setupI13n from '../../core/setupI13n';

let eventsQueue = [];

const mockData = {
  options: {},
  plugins: [
    {
      name: 'test',
      eventHandlers: {
        created: () => {
          eventsQueue.push({
            action: 'create'
          });
        },
        click: (payload) => {
          const { i13nNode } = payload;
          eventsQueue.push({
            action: 'click',
            label: i13nNode.getText(),
            model: i13nNode.getMergedModel()
          });
        }
      }
    }
  ]
};

// Use React 16 internal, might break in later release
function findProps(elem) {
  try {
    return elem[
      Object.keys(elem).find(
        key => key.indexOf('__reactInternalInstance') === 0 || key.indexOf('_reactInternalComponent') === 0
      )
    ].memoizedProps;
  } catch (e) {
    console.log('exception');
  }
}

const wrappedByI13nRoot = (ui, options = mockData.options, plugins = mockData.plugins) => {
  const RootApp = setupI13n(({ children }) => children, options, plugins);
  return <RootApp>{ui}</RootApp>;
};

describe('createI13nNode', () => {
  beforeEach(() => {
    // http://fb.me/react-polyfills
    global.requestAnimationFrame = function (callback) {
      setTimeout(callback, 0);
    };
    window.innerHeight = 100;
  });

  afterEach(() => {
    eventsQueue = [];
  });

  it('should generate a component with createI13nNode', (done) => {
    const TestComponent = () => {
      const { i13nNode } = useContext(I13nContext);

      expect(i13nNode.getModel()).toEqual({ sec: 'foo' });
      done();

      return <div />;
    };

    TestComponent.displayName = 'TestComponent';

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    expect(I13nTestComponent.displayName).toEqual('I13nTestComponent');

    render(wrappedByI13nRoot(<I13nTestComponent i13nModel={{ sec: 'foo' }} />));
  });

  it('should generate a component with createI13nNode and custome name', () => {
    const TestComponent = () => <div />;
    TestComponent.displayName = 'TestComponent';

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent, {}, { displayName: 'CustomeName' });
    expect(I13nTestComponent.displayName).toEqual('CustomeName');
  });

  // hoistNonReactStatics
  it('should generate a component with createI13nNode with statics', (done) => {
    const TestComponent = () => <div />;
    TestComponent.displayName = 'TestComponent';
    TestComponent.foo = 'bar';

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    expect(I13nTestComponent.foo).toEqual('bar');
    done();
  });

  it("should handle the case if reactI13n doesn't inititalized", () => {
    const TestComponent = () => <div />;
    TestComponent.displayName = 'TestComponent';

    const I13nTestComponent = createI13nNode(TestComponent);
    // rendered without provider
    const { container } = render(<I13nTestComponent />);
    expect(container).toBeDefined();
  });

  it('should handle the case of unmount', () => {
    let rootI13nNode = null;

    const TestComponent = () => {
      const { parentI13nNode } = useContext(I13nContext);
      // only one layer, parent is root for this case
      rootI13nNode = parentI13nNode;
      return <div />;
    };
    TestComponent.displayName = 'TestComponent';

    const I13nTestComponent = createI13nNode(TestComponent);
    const { unmount } = render(wrappedByI13nRoot(<I13nTestComponent />));
    expect(typeof rootI13nNode.getChildrenNodes()[0]).toEqual('object');
    unmount(); // unmount should remove the child from root
    expect(rootI13nNode.getChildrenNodes()[0]).toEqual(undefined);
  });

  it('should be able to bind click handler', () => {
    const TestComponent = () => <div data-testid="node" />;
    TestComponent.displayName = 'TestComponent';

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);
    const { container, getByTestId } = render(wrappedByI13nRoot(<I13nTestComponent bindClickEvent />));
    expect(container).toBeDefined();
    fireEvent.click(getByTestId('node'));
    expect(eventsQueue.some(({ action }) => action === 'click')).toEqual(true);
  });

  it('should handle scan the links inside if autoScanLinks is enable', () => {
    const TestComponent = () => (
      <div data-testid="node">
        <a data-testid="anchor" href="/foo">
          foo
        </a>
        <button data-testid="button">bar</button>
      </div>
    );
    TestComponent.displayName = 'TestComponent';

    const I13nTestComponent = createI13nNode(TestComponent);

    const { getByTestId } = render(wrappedByI13nRoot(<I13nTestComponent scanLinks={{ enable: true }} />));

    const anchor = getByTestId('anchor');
    const button = getByTestId('button');

    fireEvent.click(anchor);
    expect(eventsQueue.some(({ label }) => label === 'foo')).toEqual(true);

    fireEvent.click(button);
    expect(eventsQueue.some(({ label }) => label === 'bar')).toEqual(true);
  });

  // @TODO, decide to support props.i13n or not
  it.skip('should able to use props.getI13nNode to get the nearest i13n node', () => {
    const TestComponent = (props) => {
      expect(props.i13n.getI13nNode().getModel()).toEqual({ foo: 'bar' });
      return <div />;
    };
    TestComponent.displayName = 'TestComponent';
    const I13nTestComponent = createI13nNode(TestComponent, {});
    render(wrappedByI13nRoot(<I13nTestComponent i13nModel={{ foo: 'bar' }} />));
  });

  // @TODO, decide to support props.i13n or not
  it.skip('should able to use props.executeEvent to execute i13n event', (done) => {
    const TestComponent = (props) => {
      props.i13n.executeEvent('foo', {});
      return <div />;
    };
    TestComponent.displayName = 'TestComponent';

    let executeCount = 0;
    mockData.reactI13n.execute = function (eventName) {
      executeCount += 1;
      if (executeCount === 1) {
        expect(eventName).toEqual('foo');
        done();
      }
    };
    mockData.isViewportEnabled = false;
    const I13nTestComponent = createI13nNode(TestComponent, {});
    render(<I13nTestComponent i13nModel={{ foo: 'bar' }} />);
  });

  it('should update the i13n model when component updates', () => {
    const i13nModel = {
      sec: 'foo'
    };

    const TestComponent = () => {
      const { i13nNode } = useContext(I13nContext);

      expect(i13nNode.getModel()).toEqual(i13nModel);
      return <div />;
    };

    TestComponent.displayName = 'TestComponent';

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);

    const { container, rerender } = render(wrappedByI13nRoot(<I13nTestComponent i13nModel={i13nModel} />));

    i13nModel.sec = 'bar';

    rerender(wrappedByI13nRoot(<I13nTestComponent i13nModel={i13nModel} />));
  });

  // @TODO, haven't implement viewport
  it.skip('should handle the case if we enable viewport checking', () => {
    jest.useFakeTimers();
    const TestSubComponent = () => <div />;
    TestSubComponent.displayName = 'TestSubComponent';

    const I13nTestSubComponent = createI13nNode(TestSubComponent);

    const TestComponent = () => <I13nTestSubComponent />;
    TestComponent.displayName = 'TestComponent';

    const I13nTestComponent = createI13nNode(TestComponent);
    mockData.isViewportEnabled = true;
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName, payload) {
      executedArray.push(eventName);
    };
    render(<I13nTestComponent />);
    jest.runAllTimers();
    expect(executedArray[0]).toEqual('created');
    expect(executedArray[1]).toEqual('created');
    expect(executedArray[2]).toEqual('enterViewport');
    expect(executedArray[3]).toEqual('enterViewport');
  });

  it.skip('should handle the case if we enable viewport checking with subComponents generated by scanLinks', () => {
    jest.useFakeTimers();
    mockData.isViewportEnabled = true;

    const NestedTestComponent = () => (
      <div>
        <a href="/foo">foo</a>
        <button>bar</button>
      </div>
    );
    NestedTestComponent.displayName = 'NestedTestComponent';

    const I13nTestComponent = createI13nNode(NestedTestComponent);
    // should get three created events
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName) {
      executedArray.push(eventName);
    };

    render(<I13nTestComponent scanLinks={{ enable: true }} />);
    jest.runAllTimers();
    expect(executedArray[0]).toEqual('created');
    expect(executedArray[1]).toEqual('created');
    expect(executedArray[2]).toEqual('created');
    expect(executedArray[3]).toEqual('enterViewport');
    expect(executedArray[4]).toEqual('enterViewport');
    expect(executedArray[5]).toEqual('enterViewport');
  });

  it.skip('should still subscribe listeners if parent is not in viewport', () => {
    jest.useFakeTimers();
    mockData.isViewportEnabled = true;
    window.innerHeight = -30; // we can't change the rect of the nodes, fake innerHeight to fail the viewport detection

    const TestSubComponent = () => <div />;
    TestSubComponent.displayName = 'TestSubComponent';

    const I13nTestSubComponent = createI13nNode(TestSubComponent);

    const TestComponent = () => <I13nTestSubComponent />;
    TestComponent.displayName = 'TestComponent';

    const I13nTestComponent = createI13nNode(TestComponent);

    // should get three created events
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName) {
      executedArray.push(eventName);
    };

    render(<I13nTestComponent />);

    jest.runAllTimers();
    expect(executedArray.length).toEqual(2);
    expect(executedArray[0]).toEqual('created');
    expect(executedArray[1]).toEqual('created');
    expect(executedArray[2]).toBeUndefined(); // no enterViewport should happen here
    expect(mockSubscribers.length).toEqual(2); // should still get 2 subscribers for viewport
    expect(mockSubscribers[0].eventName).toEqual('scrollEnd');
    expect(mockSubscribers[1].eventName).toEqual('scrollEnd');
  });

  it.skip("should stop scanned nodes' viewport detection if parent is not in viewport", () => {
    jest.useFakeTimers();
    mockData.isViewportEnabled = true;
    window.innerHeight = -30; // we can't change the rect of the nodes, fake innerHeight to fail the viewport detection

    const TestComponent = () => (
      <div>
        <a href="/foo">foo</a>
        <button>bar</button>
      </div>
    );
    TestComponent.displayName = 'TestComponent';
    const I13nTestComponent = createI13nNode(TestComponent);

    // should get three created events
    const executedArray = [];
    mockData.reactI13n.execute = function (eventName) {
      executedArray.push(eventName);
    };

    render(<I13nTestComponent scanLinks={{ enable: true }} />);

    jest.runAllTimers();
    expect(executedArray[0]).toEqual('created');
    expect(executedArray[1]).toEqual('created');
    expect(executedArray[2]).toEqual('created');
    expect(executedArray[3]).toBeUndefined(); // no enterViewport should happen here
    expect(mockSubscribers.length).toEqual(1);
  });

  it('should not cause error if we pass a undefined to createI13nNode', (done) => {
    console.warn = function (msg) {
      expect(msg).toEqual('You are passing a null component into createI13nNode');
      done();
    };
    console.trace = jest.fn();
    const I13nTestComponent = createI13nNode(undefined);
    expect(I13nTestComponent).toEqual(null);
  });

  // @TODO i13n as props
  it.skip('should get i13n util functions via both props and context', (done) => {
    const TestComponent = (props, context) => {
      const { i13n } = props;

      expect(i13n).toBeDefined();
      expect(i13n.executeEvent).toBeDefined();
      expect(i13n.getI13nNode).toBeDefined();
      expect(context.i13n).toBeDefined();
      expect(context.i13n.executeEvent).toBeDefined();
      expect(context.i13n.getI13nNode).toBeDefined();
      done();

      return <div />;
    };
    TestComponent.displayName = 'TestComponent';
    TestComponent.contextTypes = {
      i13n: PropTypes.object
    };

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent, {});
    mockData.reactI13n.execute = function (eventName) {
      // should get a created event
      expect(eventName).toEqual('created');
      done();
    };
    expect(I13nTestComponent.displayName).toEqual('I13nTestComponent');
    render(<I13nTestComponent i13nModel={{ sec: 'foo' }} />);
  });

  // @TODO, needs to update test after adding React.forwardRef
  it.skip('should expose the wrapped component as refs.wrappedElement', () => {
    class TestComponent extends React.Component {
      render() {
        return <div />;
      }
    }

    const I13nTestComponent = createI13nNode(TestComponent, {}, { refToWrappedComponent: 'wrappedElement' });
    mockData.reactI13n.execute = function () {};
    const { container } = render(<I13nTestComponent />);
    expect(container.refs).toBeInstanceOf(TestComponent);
  });

  it.skip('should not pass i13n props to string components', () => {
    const props = {
      i13nModel: { sec: 'foo' },
      href: '#/foobar'
    };

    const I13nTestComponent = createI13nNode(
      'a',
      {
        follow: true,
        isLeafNode: true,
        bindClickEvent: true,
        scanLinks: { enable: true }
      },
      {
        refToWrappedComponent: 'wrappedElement'
      }
    );
    const { container } = render(<I13nTestComponent {...props} />);
    expect(findProps(container.firstChild)).toEqual({
      href: '#/foobar',
      children: undefined
    });
  });
});
