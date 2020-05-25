/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';

import setupI13n from '../../../src/utils/setupI13n';

const mockData = {
  options: {},
  reactI13n: null,
  plugin: {
    name: 'test'
  }
};

// https://jestjs.io/docs/en/es6-class-mocks
jest.mock('../../../src/libs/ReactI13n', () => jest.fn().mockImplementation(() => {
  const _plugins = [];
  const _options = {};
  let _rootI13nNode = {};
  mockData.reactI13n = {};
  mockData.reactI13n._options = _options;
  mockData.reactI13n._plugins = _plugins;
  mockData.reactI13n._rootI13nNode = _rootI13nNode;

  return {
    getInstance: () => mockData.reactI13n,
    plug: (plugin) => {
      _plugins.push(plugin);
    },
    createRootI13nNode: () => {
      _rootI13nNode = {};
    }
  };
}));

describe('setupI13n', () => {
  beforeEach(() => {
    // http://fb.me/react-polyfills
    global.requestAnimationFrame = function (callback) {
      setTimeout(callback, 0);
    };
  });

  it('should generate a component with setupI13n', () => {
    const TestApp = () => <div />;
    TestApp.displayName = 'TestApp';

    // check the initial state is correct after render
    const I13nTestApp = setupI13n(TestApp, mockData.options, [mockData.plugin]);
    expect(I13nTestApp.displayName).toEqual('RootI13nTestApp');
    render(<I13nTestApp />);

    expect(mockData.reactI13n._options).toEqual(mockData.options);
    expect(mockData.reactI13n._plugins[0]).toEqual(mockData.plugin);
    expect(typeof mockData.reactI13n._rootI13nNode).toEqual('object');
  });

  it('should generate a component with setupI13n and custom display name', () => {
    const TestApp = () => <div />;
    TestApp.displayName = 'TestApp';

    // check the initial state is correct after render
    const I13nTestApp = setupI13n(TestApp, { displayName: 'CustomName' });
    expect(I13nTestApp.displayName).toEqual('CustomName');
  });

  it('should get i13n util functions via both props and context', (done) => {
    class TestApp extends React.Component {
      static displayName = 'TestApp';

      static contextTypes = {
        i13n: PropTypes.object
      };

      render() {
        expect(typeof this.props.i13n).toEqual('object');
        expect(typeof this.props.i13n.executeEvent).toEqual('function');
        expect(typeof this.props.i13n.getI13nNode).toEqual('function');
        expect(typeof this.context.i13n).toEqual('object');
        expect(typeof this.context.i13n.executeEvent).toEqual('function');
        expect(typeof this.context.i13n.getI13nNode).toEqual('function');
        done();
        return <div />;
      }
    }
    const I13nTestApp = setupI13n(TestApp, [mockData.plugin]);
    render(<I13nTestApp />);
  });

  it('should not get i13n util functions via props if skipUtilFunctionsByProps=true', (done) => {
    class TestApp extends React.Component {
      static displayName = 'TestApp';

      static contextTypes = {
        i13n: PropTypes.object
      };

      render() {
        expect(this.props.i13n).toBeUndefined();
        done();
        return <div />;
      }
    }
    const I13nTestApp = setupI13n(TestApp, { skipUtilFunctionsByProps: true }, [mockData.plugin]);
    render(<TestApp />);
  });
});
