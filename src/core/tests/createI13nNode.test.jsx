/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/* All the functionalities are tested with this higher order component */

import React, { useContext } from 'react';
import { render, fireEvent } from '@testing-library/react';

import createI13nNode from '../createI13nNode';
import I13nContext from '../../components/core/I13nContext';
import setupI13n from '../setupI13n';

let eventsQueue = [];

const mockData = {
  options: {},
  plugins: [
    {
      name: 'test',
      eventHandlers: {
        created: () => {
          eventsQueue.push({
            action: 'create',
          });
        },
        click: (payload) => {
          const { i13nNode } = payload;
          eventsQueue.push({
            action: 'click',
            label: i13nNode.getText(),
            model: i13nNode.getMergedModel(),
          });
        },
      },
    },
  ],
};

const wrappedByI13nRoot = (
  ui,
  options = mockData.options,
  plugins = mockData.plugins
) => {
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
    const I13nTestComponent = createI13nNode(
      TestComponent,
      {},
      { displayName: 'CustomeName' }
    );
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
    const { container, getByTestId } = render(
      wrappedByI13nRoot(<I13nTestComponent bindClickEvent />)
    );
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

    const { getByTestId } = render(
      wrappedByI13nRoot(<I13nTestComponent scanLinks={{ enable: true }} />)
    );

    const anchor = getByTestId('anchor');
    const button = getByTestId('button');

    fireEvent.click(anchor);
    expect(eventsQueue.some(({ label }) => label === 'foo')).toEqual(true);

    fireEvent.click(button);
    expect(eventsQueue.some(({ label }) => label === 'bar')).toEqual(true);
  });

  it('should update the i13n model when component updates', () => {
    const i13nModel = {
      sec: 'foo',
    };

    const TestComponent = () => {
      const { i13nNode } = useContext(I13nContext);

      expect(i13nNode.getModel()).toEqual(i13nModel);
      return <div />;
    };

    TestComponent.displayName = 'TestComponent';

    // check the initial state is correct after render
    const I13nTestComponent = createI13nNode(TestComponent);

    const { rerender } = render(
      wrappedByI13nRoot(<I13nTestComponent i13nModel={i13nModel} />)
    );

    i13nModel.sec = 'bar';

    rerender(wrappedByI13nRoot(<I13nTestComponent i13nModel={i13nModel} />));
  });

  it('should not cause error if we pass a undefined to createI13nNode', (done) => {
    console.warn = function (msg) {
      expect(msg).toEqual(
        'You are passing a null component into createI13nNode'
      );
      done();
    };
    console.trace = jest.fn();
    const I13nTestComponent = createI13nNode(undefined);
    expect(I13nTestComponent).toEqual(null);
  });
});
