/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import DebugDashboard from '../../../src/libs/DebugDashboard';
import I13nNode from '../../../src/libs/I13nNode';

describe('clickHandler', () => {
  it('should able to generate debug dashboard correctly', () => {
    const i13nNode = new I13nNode(null, {});
    const domNode = document.getElementById('testnode');
    i13nNode.setDOMNode(domNode);
    const debugDashboard = new DebugDashboard(i13nNode);
    expect(document.getElementById('i13n-debug-0')).toBeDefined();
    debugDashboard.destroy();
  });
});
