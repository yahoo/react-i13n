/**
 * Copyright 2015 - Present, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React, { Component, useContext } from 'react';
import { render } from '@testing-library/react';

import setupI13n from '../setupI13n';
import I13nContext from '../../components/core/I13nContext';

const mockData = {
  options: {},
  plugin: {
    name: 'test'
  }
};

describe('setupI13n', () => {
  beforeAll(() => {
    // http://fb.me/react-polyfills
    global.requestAnimationFrame = function (callback) {
      setTimeout(callback, 0);
    };
  });

  it('should generate a component with setupI13n', () => {
    let testContext;
    const TestApp = () => {
      const context = useContext(I13nContext);
      testContext = context;
      return <div />;
    };
    TestApp.displayName = 'TestApp';

    // check the initial state is correct after render
    const I13nTestApp = setupI13n(TestApp, mockData.options, [mockData.plugin]);
    expect(I13nTestApp.displayName).toEqual('RootI13nTestApp');
    render(<I13nTestApp />);
    const reactI13n = testContext.i13nInstance;
    expect(reactI13n._plugins.test).toEqual(mockData.plugin);
    expect(typeof reactI13n._rootI13nNode).toEqual('object');
  });

  it('should generate a component with custom displayName', () => {
    const TestApp = () => {
      return <div />;
    };

    // check the initial state is correct after render
    const I13nTestApp = setupI13n(TestApp, {
      displayName: 'Foo'
    }, [mockData.plugin]);
    expect(I13nTestApp.displayName).toEqual('Foo');
    render(<I13nTestApp />);
  });


  it('should generate a component with setupI13n and custom display name', () => {
    const TestApp = () => <div />;
    TestApp.displayName = 'TestApp';

    // check the initial state is correct after render
    const I13nTestApp = setupI13n(TestApp, { displayName: 'CustomName' });
    expect(I13nTestApp.displayName).toEqual('CustomName');
  });

  it('should get i13n util functions via context', (done) => {
    class TestApp extends Component {
      static displayName = 'TestApp';

      static contextType = I13nContext;

      render() {
        expect(typeof this.context.i13nInstance).toEqual('object');
        expect(typeof this.context.executeEvent).toEqual('function');
        done();
        return <div />;
      }
    }
    const I13nTestApp = setupI13n(TestApp, {}, [mockData.plugin]);
    render(<I13nTestApp />);
  });

  it('should get i13n util functions via props', (done) => {
    class TestApp extends Component {
      static displayName = 'TestApp';

      render() {
        expect(typeof this.props.i13n.i13nInstance).toEqual('object');
        expect(typeof this.props.i13n.executeEvent).toEqual('function');
        done();
        return <div />;
      }
    }
    const I13nTestApp = setupI13n(TestApp, {}, [mockData.plugin]);
    render(<I13nTestApp />);
  });

  it('should get not i13n util functions via props if skipUtilFunctionsByProps is true', (done) => {
    class TestApp extends Component {
      static displayName = 'TestApp';

      render() {
        expect(this.props.i13n).toBeUndefined();
        done();
        return <div />;
      }
    }
    const I13nTestApp = setupI13n(TestApp, { skipUtilFunctionsByProps: true }, [mockData.plugin]);
    render(<I13nTestApp />);
  });
});
