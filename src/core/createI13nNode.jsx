/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React, { useContext, forwardRef } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import getDisplayName from '../utils/getDisplayName';
import warnAndPrintTrace from '../utils/warnAndPrintTrace';

import CoreComponent from '../components/core/CoreComponent';
import I13nContext from '../components/core/I13nContext';

import useI13nNode from '../hooks/useI13nNode';

const isFunctionalComponent = TargetComponent => typeof TargetComponent === 'function';
// && !(TargetComponent.prototype && TargetComponent.prototype.isReactComponent);

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
    refToWrappedComponent
  } = options;

  const I13nComponentWrapper = (props) => {
    const {
      // i13n props
      bindClickEvent,
      follow,
      i13n,
      i13nModel,
      isLeafNode,
      scanLinks,
      shouldFollowLink,

      children,
      ...restProps
    } = props;

    const {
      executeEvent,
      i13nInstance,
      i13nNode: parentI13nNode
    } = useContext(I13nContext);

    const i13nProps = {
      bindClickEvent,
      follow,
      i13n,
      i13nModel,
      isLeafNode,
      scanLinks,
      shouldFollowLink,
      ...(refToWrappedComponent ? {
        ref: refToWrappedComponent // @TODO, won't work here, need to forwardRef
      } : {})
    };

    const WrappedComponent = forwardRef((innerProps, ref) => (
      <span ref={ref} style={{ all: 'inherit' }}>
        <Component {...innerProps}>{innerProps.children}</Component>
      </span>
    ));

    const node = (
      <CoreComponent {...i13nProps}>
        <WrappedComponent {...restProps}>
          {children}
        </WrappedComponent>
      </CoreComponent>
    );

    const {
      i13nNode
    } = useI13nNode({
      parentI13nNode,
      i13nInstance,
      isLeafNode,
      i13nModel
    });

    // overrides node/parent node
    const contextValue = {
      executeEvent,
      i13nInstance,
      i13nNode,
      parentI13nNode
    };

    return (
      <I13nContext.Provider value={contextValue}>
        {node}
      </I13nContext.Provider>
    );
  };

  I13nComponentWrapper.displayName = options.displayName ?? `I13n${componentName}`;

  I13nComponentWrapper.defaultProps = {
    i13nModel: undefined,
    isLeafNode: false,
    bindClickEvent: false,
    follow: false,
    scanLinks: undefined,
    ...defaultProps
  };

  if (componentIsFunction) {
    return hoistNonReactStatics(I13nComponentWrapper, Component);
  }

  return I13nComponentWrapper;
}

export default createI13nNode;
