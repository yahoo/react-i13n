/**
 * Copyright 2020, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import I13nNode from '../I13nNode';

describe('I13nNode', () => {
  beforeEach(() => {
    global.Node = {
      DOCUMENT_POSITION_PRECEDING: 2
    };
  });

  it('should be created correctly', () => {
    const model = {
      sec: 'foo'
    };
    const i13nNode = new I13nNode(null, model, true, true);
    expect(i13nNode.getMergedModel()).toEqual(model);
    expect(i13nNode.getParentNode()).toEqual(null);
    expect(i13nNode.isLeafNode()).toEqual(true);
    expect(i13nNode.isInViewport()).toEqual(false);
  });

  it('should be created correctly with function model', () => {
    const modelData = {
      sec: 'foo-generated'
    };
    const model = function () {
      return modelData;
    };
    const i13nNode = new I13nNode(null, model, true, true);
    expect(i13nNode.getMergedModel()).toEqual(modelData);
    expect(i13nNode.getParentNode()).toEqual(null);
    expect(i13nNode.isLeafNode()).toEqual(true);
    expect(i13nNode.isInViewport()).toEqual(false);
  });

  it('should be able to append a child and work correctly with model data', () => {
    const i13nNodeParent = new I13nNode(null, { psec: 'parent' }, true, true);
    const i13nNodeChild = new I13nNode(i13nNodeParent, { sec: 'child' }, true, true);
    expect(i13nNodeParent.getChildrenNodes().length).toEqual(1);
    expect(i13nNodeParent.getChildrenNodes()[0]).toEqual(i13nNodeChild);
    expect(i13nNodeParent.getChildrenNodes()[0].getMergedModel()).toEqual({
      psec: 'parent',
      sec: 'child'
    });
  });

  it('should be able to append a child and work correctly with model data, should not have ref issue', () => {
    const parentModel = { psec: 'parent' };
    const childModel = { sec: 'child' };
    const i13nNodeParent = new I13nNode(null, parentModel, true, true);
    const i13nNodeChild = new I13nNode(i13nNodeParent, childModel, true, true);
    expect(i13nNodeParent.getChildrenNodes().length).toEqual(1);
    expect(i13nNodeParent.getChildrenNodes()[0]).toEqual(i13nNodeChild);
    expect(i13nNodeParent.getChildrenNodes()[0].getMergedModel()).toEqual({
      psec: 'parent',
      sec: 'child'
    });
    i13nNodeParent.getMergedModel().foo = 'bar';
    expect(parentModel).toEqual({ psec: 'parent' }); // should not be changed
    expect(childModel).toEqual({ sec: 'child' });
  });

  it.skip('should be able to append a child and work correctly with position', () => {
    const mockDomNode = {
      compareDocumentPosition() {
        return 2; // Node.DOCUMENT_POSITION_PRECEDING
      }
    };
    const i13nNodeParent = new I13nNode(null, { psec: 'parent' }, true, true);
    const i13nNodeChild1 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, true);
    const i13nNodeChild2 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, true);
    const i13nNodeChild3 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, true);
    const i13nNodeChild4 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, true);
    i13nNodeChild1.setDOMNode(mockDomNode);
    i13nNodeChild2.setDOMNode(mockDomNode);
    i13nNodeChild3.setDOMNode(mockDomNode);
    i13nNodeChild4.setDOMNode(mockDomNode);
    expect(i13nNodeParent.getChildrenNodes().length).toEqual(4);
    // since the mockDomNode always return Node.DOCUMENT_POSITION_PRECEDING, so the order is the same as they insert
    expect(i13nNodeParent.isOrderDirty()).toEqual(true);
    expect(i13nNodeChild1.getPosition()).toEqual(1);
    expect(i13nNodeParent.isOrderDirty()).toEqual(false); // only need to sort once
    expect(i13nNodeChild2.getPosition()).toEqual(2);
    expect(i13nNodeChild3.getPosition()).toEqual(3);
    expect(i13nNodeChild4.getPosition()).toEqual(4);
  });

  it('should be able to traverse the children', () => {
    const i13nNodeParent = new I13nNode(null, { psec: 'parent' }, true, false);
    const i13nNodeChild1 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);
    const i13nNodeChild2 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);
    const i13nNodeChild3 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);
    const i13nNodeChild4 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);
    const traverseArray = [];
    expect(i13nNodeParent.getChildrenNodes().length).toEqual(4);
    i13nNodeParent.traverseNodes((child) => {
      child.setCustomAttribute('traversed', true);
      traverseArray.push(child);
    });
    expect(traverseArray.length).toEqual(5);
    expect(i13nNodeChild1.getCustomAttribute('traversed')).toEqual(true);
    expect(i13nNodeChild2.getCustomAttribute('traversed')).toEqual(true);
    expect(i13nNodeChild3.getCustomAttribute('traversed')).toEqual(true);
    expect(i13nNodeChild4.getCustomAttribute('traversed')).toEqual(true);
  });

  it('should be handle append child correctly', () => {
    const i13nNodeParent = new I13nNode(null, { psec: 'parent' }, true, false);
    const i13nNodeChild1 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);
    const i13nNodeChild2 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);
    const i13nNodeChild3 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);
    const traverseArray = [];
    expect(i13nNodeParent.getChildrenNodes().length).toEqual(3);
    i13nNodeParent.traverseNodes((child) => {
      child.setCustomAttribute('traversed', true);
      traverseArray.push(child);
    });
    expect(i13nNodeParent.getCustomAttribute('traversed')).toEqual(true);
    // start to append child, should get on change event and clear the traverse status
    const i13nNodeChild4 = new I13nNode(i13nNodeParent, { sec: 'child' }, true, false);

    expect(i13nNodeChild1.getCustomAttribute('traversed')).toEqual(true);
    expect(i13nNodeChild2.getCustomAttribute('traversed')).toEqual(true);
    expect(i13nNodeChild3.getCustomAttribute('traversed')).toEqual(true);
    expect(i13nNodeChild4.getCustomAttribute('traversed')).toEqual(true);
  });

  it('should remove child correctly', () => {
    const i13nNodeParent = new I13nNode(null, { psec: 'parent' }, true, true);
    const i13nNodeChild = new I13nNode(i13nNodeParent, { sec: 'child' }, true, true);
    expect(i13nNodeParent.getChildrenNodes().length).toEqual(1);
    // after getposition, IsOrderDirty should be false
    i13nNodeChild.getPosition();
    expect(i13nNodeParent.isOrderDirty()).toEqual(false);

    i13nNodeParent.removeChildNode(i13nNodeChild);

    // after remove child, IsOrderDirty is set as true
    expect(i13nNodeParent.isOrderDirty()).toEqual(true);
    expect(i13nNodeParent.getChildrenNodes().length).toEqual(0);
  });

  it('should be able to get text of the dom node', () => {
    const mockDomNode = {
      value: 'bar'
    };
    const i13nNode = new I13nNode(null, { sec: 'foo' }, true, true);
    i13nNode.setDOMNode(mockDomNode);
    expect(i13nNode.getText()).toEqual('bar');
  });

  it('should be able to set the parent node', () => {
    const model = {
      sec: 'foo-generated'
    };
    const parentModel = {
      sec: 'foo-parent'
    };
    const i13nNode = new I13nNode(null, model, true, true);
    const parentNode = new I13nNode(null, parentModel, true, true);
    expect(i13nNode.getMergedModel()).toEqual(model);
    expect(i13nNode.getParentNode()).toEqual(null);
    i13nNode.setParentNode(parentNode);
    expect(i13nNode.getParentNode()).toEqual(parentNode);
  });

  it('should be able to get and set react component', () => {
    const mockReactComponent = {
      foo: 'bar'
    };
    const i13nNode = new I13nNode(null, { sec: 'foo' }, true, true);
    i13nNode.setReactComponent(mockReactComponent);
    expect(i13nNode.getReactComponent()).toEqual(mockReactComponent);
  });

  it('should be able to update i13n model', () => {
    const i13nNode = new I13nNode(null, { sec: 'foo', sec2: 'bar' }, true, true);
    i13nNode.updateModel({ sec2: 'baz', sec3: 'foo' });
    expect(i13nNode.getModel()).toEqual({ sec: 'foo', sec2: 'baz', sec3: 'foo' });
  });
});
