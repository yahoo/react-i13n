/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */
'use strict';

/* All the functionalities are tested with this higher order component */

import augmentComponent from '../../../src/utils/augmentComponent';
import expect from 'expect.js';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom/server';
        
describe('augmentComponent', () => {
    it('should be able add props to the original object', () => {
        class Foo {
            foo () {}
        }
        augmentComponent(Foo, {bar: () => null}, {baz: 'test'});
        expect(Foo.baz).to.equal('test');
        expect(Foo.prototype.bar).to.be.a('function')
    });
    
    it('should be able add life cycle events to a React component', () => {
        let fooComponentWillMount = sinon.stub();
        let augmentedComponentWillMount = sinon.stub();
        class FooComponent extends React.Component {
            componentWillMount (...args) {
                fooComponentWillMount.apply(this, args);
            }
            render () {
                return null;
            }
        }
        FooComponent.propTypes = {
            foo: React.PropTypes.string
        };
        augmentComponent(FooComponent, {
            componentWillMount: augmentedComponentWillMount
        }, {
            propTypes: {
                bar: React.PropTypes.string
            }
        });
        // check static props, should do a merge
        expect(FooComponent.propTypes.foo).to.eql(React.PropTypes.string);
        expect(FooComponent.propTypes.bar).to.eql(React.PropTypes.string);
        ReactDOM.renderToString(React.createElement(FooComponent, {}));
        // both componentWillMount should be called
        expect(fooComponentWillMount.callCount).to.equal(1);
        expect(augmentedComponentWillMount.callCount).to.equal(1);
    });
});
