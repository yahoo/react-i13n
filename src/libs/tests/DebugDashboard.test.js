/**
 * @jest-environment jsdom
 */
/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import DebugDashboard from '../DebugDashboard';
import I13nNode from '../../core/I13nNode';

describe('clickHandler', () => {
  it('should able to generate debug dashboard correctly', () => {
    const i13nNode = new I13nNode(null, {});
    const domNode = document.getElementById('testnode');
    i13nNode.setDOMNode(domNode);
    const debugDashboard = new DebugDashboard(i13nNode);
    expect(document.getElementById('i13n-debug-0')).toBeDefined();
    debugDashboard.destroy();
  });

  it('should fall back to legacy react-dom api when react-dom/client is unavailable', () => {
    const render = jest.fn((element, container, callback) => callback());
    const unmountComponentAtNode = jest.fn();

    jest.isolateModules(() => {
      jest.doMock('react-dom/client', () => {
        throw new Error("Cannot find module 'react-dom/client'");
      });
      jest.doMock('react-dom', () => ({ render, unmountComponentAtNode }));

      /* eslint-disable global-require */
      const LegacyDebugDashboard = require('../DebugDashboard').default;
      const LegacyI13nNode = require('../../core/I13nNode').default;
      /* eslint-enable global-require */

      const i13nNode = new LegacyI13nNode(null, {});
      i13nNode.setDOMNode(document.body.appendChild(document.createElement('div')));
      const debugDashboard = new LegacyDebugDashboard(i13nNode);
      const { container } = debugDashboard;
      expect(render).toHaveBeenCalledWith(expect.anything(), container, expect.any(Function));

      debugDashboard.destroy();
      expect(unmountComponentAtNode).toHaveBeenCalledWith(container);
    });

    jest.dontMock('react-dom/client');
    jest.dontMock('react-dom');
  });
});
