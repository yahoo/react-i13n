/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe, it, beforeEach, afterEach */

'use strict';

var expect = require('expect.js');
var I13nNode = require('../../../../dist/libs/I13nNode');

describe('I13nNode', function () {
    beforeEach(function () {
        global.Node = {
            DOCUMENT_POSITION_PRECEDING: 2
        }
    });

    it('should be created correctly', function () {
        var model = {
            sec: 'foo'
        };
        var i13nNode = new I13nNode(null, model, true, true);
        expect(i13nNode.getMergedModel()).to.eql(model);
        expect(i13nNode.getParentNode()).to.eql(null);
        expect(i13nNode.isLeafNode()).to.eql(true);
        expect(i13nNode.isInViewport()).to.eql(false);
    });

    it('should be created correctly with function model', function () {
        var modelData = {
            sec: 'foo-generated'
        };
        var model = function () {
            return modelData;
        };
        var i13nNode = new I13nNode(null, model, true, true);
        expect(i13nNode.getMergedModel()).to.eql(modelData);
        expect(i13nNode.getParentNode()).to.eql(null);
        expect(i13nNode.isLeafNode()).to.eql(true);
        expect(i13nNode.isInViewport()).to.eql(false);
    });

    it('should be able to append a child and work correctly with model data', function () {
        var i13nNodeParent = new I13nNode(null, {psec: 'parent'}, true, true);
        var i13nNodeChild = new I13nNode(i13nNodeParent, {sec: 'child'}, true, true);
        expect(i13nNodeParent.getChildrenNodes().length).to.eql(1);
        expect(i13nNodeParent.getChildrenNodes()[0]).to.eql(i13nNodeChild);
        expect(i13nNodeParent.getChildrenNodes()[0].getMergedModel()).to.eql({psec: 'parent', sec: 'child'});
    });
    
    it('should be able to append a child and work correctly with model data, should not have ref issue', function () {
        var parentModel = {psec: 'parent'};
        var childModel = {sec: 'child'};
        var i13nNodeParent = new I13nNode(null, parentModel, true, true);
        var i13nNodeChild = new I13nNode(i13nNodeParent, childModel, true, true);
        expect(i13nNodeParent.getChildrenNodes().length).to.eql(1);
        expect(i13nNodeParent.getChildrenNodes()[0]).to.eql(i13nNodeChild);
        expect(i13nNodeParent.getChildrenNodes()[0].getMergedModel()).to.eql({psec: 'parent', sec: 'child'});
        i13nNodeParent.getMergedModel().foo = 'bar';
        expect(parentModel).to.eql({psec: 'parent'}); // should not be changed
        expect(childModel).to.eql({sec: 'child'});
    });
    
    it('should be able to append a child and work correctly with position', function () {
        var mockDomNode = {
            compareDocumentPosition: function () {
                return 2; // Node.DOCUMENT_POSITION_PRECEDING
            }
        };
        var i13nNodeParent = new I13nNode(null, {psec: 'parent'}, true, true);
        var i13nNodeChild1 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, true);
        var i13nNodeChild2 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, true);
        var i13nNodeChild3 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, true);
        var i13nNodeChild4 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, true);
        i13nNodeChild1.setDOMNode(mockDomNode);
        i13nNodeChild2.setDOMNode(mockDomNode);
        i13nNodeChild3.setDOMNode(mockDomNode);
        i13nNodeChild4.setDOMNode(mockDomNode);
        expect(i13nNodeParent.getChildrenNodes().length).to.eql(4);
        // since the mockDomNode always return Node.DOCUMENT_POSITION_PRECEDING, so the order is the same as they insert
        expect(i13nNodeParent.isOrderDirty()).to.eql(true);
        expect(i13nNodeChild1.getPosition()).to.eql(1);
        expect(i13nNodeParent.isOrderDirty()).to.eql(false); // only need to sort once
        expect(i13nNodeChild2.getPosition()).to.eql(2);
        expect(i13nNodeChild3.getPosition()).to.eql(3);
        expect(i13nNodeChild4.getPosition()).to.eql(4);
    });
    
    it('should be able to traverse the children', function () {
        var i13nNodeParent = new I13nNode(null, {psec: 'parent'}, true, false);
        var i13nNodeChild1 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
        var i13nNodeChild2 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
        var i13nNodeChild3 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
        var i13nNodeChild4 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
        var traverseArray = [];
        expect(i13nNodeParent.getChildrenNodes().length).to.eql(4);
        i13nNodeParent.traverseNodes(function traverseNode(child) {
            child.setCustomAttribute('traversed', true);
            traverseArray.push(child);
        });
        expect(traverseArray.length).to.eql(5);
        expect(i13nNodeChild1.getCustomAttribute('traversed')).to.eql(true);
        expect(i13nNodeChild2.getCustomAttribute('traversed')).to.eql(true);
        expect(i13nNodeChild3.getCustomAttribute('traversed')).to.eql(true);
        expect(i13nNodeChild4.getCustomAttribute('traversed')).to.eql(true);
    });
    
    it('should be handle append child correctly', function () {
        var i13nNodeParent = new I13nNode(null, {psec: 'parent'}, true, false);
        var i13nNodeChild1 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
        var i13nNodeChild2 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
        var i13nNodeChild3 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
        var traverseArray = [];
        expect(i13nNodeParent.getChildrenNodes().length).to.eql(3);
        i13nNodeParent.traverseNodes(function traverseNode(child) {
            child.setCustomAttribute('traversed', true);
            traverseArray.push(child);
        });
        expect(i13nNodeParent.getCustomAttribute('traversed')).to.eql(true);
        // start to append child, should get on change event and clear the traverse status
        var i13nNodeChild4 = new I13nNode(i13nNodeParent, {sec: 'child'}, true, false);
    });
    
    it('should remove child correctly', function () {
        var i13nNodeParent = new I13nNode(null, {psec: 'parent'}, true, true);
        var i13nNodeChild = new I13nNode(i13nNodeParent, {sec: 'child'}, true, true);
        expect(i13nNodeParent.getChildrenNodes().length).to.eql(1);
        // after getposition, IsOrderDirty should be false
        i13nNodeChild.getPosition();
        expect(i13nNodeParent.isOrderDirty()).to.eql(false);
        
        i13nNodeParent.removeChildNode(i13nNodeChild);

        // after remove child, IsOrderDirty is set as true
        expect(i13nNodeParent.isOrderDirty()).to.eql(true);
        expect(i13nNodeParent.getChildrenNodes().length).to.eql(0);
    });
    
    it('should be able to get text of the dom node', function () {
        var mockDomNode = {
            value: 'bar'
        }
        var i13nNode = new I13nNode(null, {sec: 'foo'}, true, true);
        i13nNode.setDOMNode(mockDomNode);
        expect(i13nNode.getText()).to.eql('bar');
    });
    
    it('should be able to set the parent node', function () {
        var model = {
            sec: 'foo-generated'
        };
        var parentModel = {
            sec: 'foo-parent'
        };
        var i13nNode = new I13nNode(null, model, true, true);
        var parentNode = new I13nNode(null, parentModel, true, true);
        expect(i13nNode.getMergedModel()).to.eql(model);
        expect(i13nNode.getParentNode()).to.eql(null);
        i13nNode.setParentNode(parentNode);
        expect(i13nNode.getParentNode()).to.eql(parentNode);
    });
    
    it('should be able to get and set react component', function () {
        var mockReactComponent = {
            foo: 'bar'
        };
        var i13nNode = new I13nNode(null, {sec: 'foo'}, true, true);
        i13nNode.setReactComponent(mockReactComponent);
        expect(i13nNode.getReactComponent()).to.eql(mockReactComponent);
    });
    
    it('should be able to update i13n model', function () {
        var i13nNode = new I13nNode(null, {sec: 'foo', sec2: 'bar'}, true, true);
        i13nNode.updateModel({sec2: 'baz', sec3: 'foo'});
         expect(i13nNode.getModel()).to.eql({sec: 'foo', sec2: 'baz', sec3: 'foo'});
    });
});
