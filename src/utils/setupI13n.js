/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React, { useEffect } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { IS_CLIENT } from './variables';
import augmentComponent from './augmentComponent';
import getDisplayName from './getDisplayName';
import I13nContext from '../components/core/I13nContext';
import pickSpecs from '../libs/ComponentSpecs';
import ReactI13n from '../libs/ReactI13n';
import useReactI13nRoot from '../hooks/useReactI13nRoot';
import useI13nNode from '../hooks/useI13nNode';

const debugLib = require('debug');

const debug = debugLib('ReactI13n');

/**
 * Create an app level component with i13n setup
 * @param {Object} Component the top level component
 *
 * @param {Object} options passed into ReactI13n
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.rootModelData model data of root i13n node
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @param {Object} options.displayName display name of the wrapper component
 *
 * @param {Array} plugins plugins
 * @method setupI13n
 */
function setupI13n(Component, options = {}, plugins = []) {
  if (!plugins.length) {
    debug('no plugins provided');
  }

  const { displayName } = options;

  const RootI13nComponent = (props) => {
    const {
      isLeafNode,
      i13nModel,
      children,
      ...restProps
    } = props;

    const {
      i13nInstance: reactI13n,
      executeI13nEvent: executeEvent
    } = useReactI13nRoot(options);

    if (reactI13n) {
      plugins.forEach((plugin) => {
        reactI13n.plug(plugin);
      });
      reactI13n.createRootI13nNode();
    }

    const parentI13nNode = reactI13n?.getRootI13nNode();

    const { i13nNode } = useI13nNode({
      i13nInstance: reactI13n,
      i13nModel,
      isLeafNode,
      parentI13nNode
    });

    const contextValue = {
      executeEvent,
      i13nInstance: reactI13n,
      i13nNode,
      parentI13nNode
    };

    return (
      <I13nContext.Provider value={contextValue}>
        <Component {...props}>
          {children}
        </Component>
      </I13nContext.Provider>
    );
  };

  RootI13nComponent.displayName = displayName || `RootI13n${getDisplayName(Component)}`;

  hoistNonReactStatics(RootI13nComponent, Component);

  return RootI13nComponent;
}

export default setupI13n;
