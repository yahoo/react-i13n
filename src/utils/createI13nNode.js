/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { warnAndPrintTrace } from '../libs/utils';
import ComponentSpecs from '../libs/ComponentSpecs';
import augmentComponent from './augmentComponent';

const PROPS_TO_FILTER = [
  'bindClickEvent',
  'follow',
  'followLink',
  'i13nModel',
  'isLeafNode',
  'scanLinks'
];

const isStatelessComponent = TargetComponent => typeof TargetComponent === 'function'
  && !(TargetComponent.prototype && TargetComponent.prototype.isReactComponent);

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
function createI13nNode(Component, defaultProps, options) {
  if (!Component) {
    warnAndPrintTrace('You are passing a null component into createI13nNode');
    return;
  }

  const componentName = Component.displayName || Component.name || Component;
  const componentIsFunction = typeof Component === 'function';

  defaultProps = Object.assign(
    {},
    {
      i13nModel: null,
      isLeafNode: false,
      bindClickEvent: false,
      follow: false,
      scanLinks: null
    },
    defaultProps
  );

  options = options || {};

  class I13nComponent extends React.Component {
    render() {
      // filter i13n related props
      // TODO, we could probably just drop this in this version
      if (undefined !== this.props.followLink) {
        warnAndPrintTrace(
          'props.followLink support is deprecated, please use props.follow instead.'
        );
      }

      const props = omit(this.props, PROPS_TO_FILTER);

      // TODO, React forward ref
      if (options.refToWrappedComponent) {
        props.ref = options.refToWrappedComponent;
      }

      if (!props.i13n && !options.skipUtilFunctionsByProps && componentIsFunction) {
        props.i13n = {
          executeEvent: this.executeI13nEvent.bind(this),
          getI13nNode: this.getI13nNode.bind(this)
        };
      }

      return React.createElement(Component, props, props.children);
    }
  }

  const specs = ComponentSpecs.pickSpecs();

  augmentComponent(
    I13nComponent,
    specs.prototype,
    Object.assign({}, specs.static, {
      displayName: options.displayName || `I13n${componentName}`,
      defaultProps
    })
  );

  if (componentIsFunction) {
    hoistNonReactStatics(I13nComponent, Component);
  }

  return I13nComponent;
}

export default createI13nNode;
