/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React, { useContext } from 'react';
import { findDOMNode } from 'react-dom';
import hoistNonReactStatics from 'hoist-non-react-statics';

import augmentComponent from './augmentComponent';
import getDisplayName from './getDisplayName';
import pickSpecs from '../libs/ComponentSpecs';
import warnAndPrintTrace from './warnAndPrintTrace';
import I13nContext from '../components/core/I13nContext';

const PROPS_TO_FILTER = [
  'bindClickEvent',
  'follow',
  'i13nModel',
  'isLeafNode',
  'scanLinks'
];

const isFunctionalComponent = TargetComponent => typeof TargetComponent === 'function';
// && !(TargetComponent.prototype && TargetComponent.prototype.isReactComponent);

function omit(obj, keys) {
  const target = {};
  for (const i in obj) {
    if (keys.indexOf(i) >= 0) {
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      continue;
    }
    target[i] = obj[i];
  }
  return target;
}

/**
 * createI13nNode higher order function to create a Component with I13nNode functionality
 * @param {Object|String} Component the component you want to create a i13nNode
 * @param {Object} defaultProps default props
 * @param {Object} options
 * @param {String} options.displayName display name
 * @param {String} options.refToWrappedComponent ref name to wrapped component
 * @param {Boolean} options.skipUtilFunctionsByProps true to prevent i13n util function to be passed via props.i13n
 * @method createI13nNode
 */
function createI13nNode(Component, defaultProps, options = {}) {
  if (!Component) {
    warnAndPrintTrace('You are passing a null component into createI13nNode');
    return null;
  }

  const componentName = getDisplayName(Component);
  const componentIsFunction = isFunctionalComponent(Component);
  const {
    refToWrappedComponent,
    skipUtilFunctionsByProps
  } = options;

  const I13nComponent = (props) => {
    const {
      executeEvent,
      getI13nNode: parentI13nNode
    } = useContext(I13nContext);
    const {
      i13n,
      children,
      ...restProps
    } = props;

    const newProps = {
      ...omit(restProps, PROPS_TO_FILTER),
      ...(refToWrappedComponent ? {
        ref: refToWrappedComponent // @TODO, won't work here, need to forwardRef
      } : {}),
      ...({ // We probably don't need to pass props anymore, just use context
        i13n: !i13n && !skipUtilFunctionsByProps && componentIsFunction ? ({
          executeEvent,
          getI13nNode: () => parentI13nNode
        }): i13n
      })
    };

    const node = <Component {...newProps}>{children}</Component>;
    // const i13nNode = findDOMNode(node);

    // overrides node/parent node
    const contextValue = {
      i13nNode: node,
      parentI13nNode
    };

    return (
      <I13nContext.Provider value={contextValue}>
        {node}
      </I13nContext.Provider>
    );
  }

  I13nComponent.displayName = options.displayName ?? `I13n${componentName}`;

  I13nComponent.defaultProps = {
    i13nModel: null,
    isLeafNode: false,
    bindClickEvent: false,
    follow: false,
    scanLinks: null,
    ...defaultProps
  };

  if (componentIsFunction) {
    return hoistNonReactStatics(I13nComponent, Component);
  }

  return I13nComponent;
}

export default createI13nNode;
