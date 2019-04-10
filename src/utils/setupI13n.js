/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { IS_CLIENT } from './variables';
import augmentComponent from './augmentComponent';
import pickSpecs from '../libs/ComponentSpecs';
import ReactI13n from '../libs/ReactI13n';

const debugLib = require('debug');

const debug = debugLib('ReactI13n');

/**
 * Create an app level component with i13n setup
 * @param {Object} Component the top level component
 * @param {Object} options passed into ReactI13n
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.rootModelData model data of root i13n node
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @param {Object} options.displayName display name of the wrapper component
 * @param {Boolean} options.skipUtilFunctionsByProps true to prevent i13n util function to be passed via props.i13n
 * @param {Array} plugins plugins
 * @method setupI13n
 */
function setupI13n(Component, options = {}, plugins = []) {
  if (!plugins.length) {
    debug('no plugins provided');
  }

  class RootI13nComponent extends React.Component {
    constructor(props) {
      super(props);
      const reactI13n = new ReactI13n(options);
      this._reactI13nInstance = reactI13n;
      // we might have case to access reactI13n instance to execute event outside react components
      // assign reactI13n to window
      if (IS_CLIENT) {
        // put in componentDidMount will be too slow
        window._reactI13nInstance = this._reactI13nInstance;
      }
      plugins.forEach((plugin) => {
        reactI13n.plug(plugin);
      });
      reactI13n.createRootI13nNode();
    }

    render() {
      const props = Object.assign({}, this.props);
      if (!options.skipUtilFunctionsByProps) {
        props.i13n = {
          executeEvent: this.executeI13nEvent.bind(this),
          getI13nNode: this.getI13nNode.bind(this),
          reactI13nInstance: this._reactI13nInstance
        };
      }
      return React.createElement(Component, props, props.children);
    }
  }

  const specs = pickSpecs({
    prototype: [
      'getChildContext',
      'executeI13nEvent',
      'getI13nNode',
      '_getReactI13n',
      '_getParentI13nNode'
    ],
    static: ['contextTypes', 'childContextTypes']
  });

  const componentName = Component.displayName || Component.name;
  augmentComponent(
    RootI13nComponent,
    specs.prototype,
    Object.assign(
      {
        displayName: options.displayName || `RootI13n${componentName}`
      },
      specs.static
    )
  );

  hoistNonReactStatics(RootI13nComponent, Component);

  return RootI13nComponent;
}

export default setupI13n;
