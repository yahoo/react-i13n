/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React, { useMemo, useEffect } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import getDisplayName from '../utils/getDisplayName';
import I13nContext from '../components/core/I13nContext';

import useI13nNode from '../hooks/useI13nNode';
import useReactI13nRoot from '../hooks/useReactI13nRoot';

const debugLib = require('debug');

const debug = debugLib('ReactI13n');

/**
 * Create an app level component with i13n setup
 * @param {Object} Component the root level component
 *
 * @param {Object} options passed into ReactI13n
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.displayName display name of the wrapper component
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @param {Object} options.rootModelData model data of root i13n node
 * @param {Boolean} options.skipUtilFunctionsByProps true to prevent i13n util function to be passed via props.i13n
 *
 * @param {Array} plugins plugins
 * @method setupI13n
 */
function setupI13n(Component, options = {}, plugins = []) {
  if (!plugins.length) {
    debug('no plugins provided');
  }

  const {
    displayName,
    skipUtilFunctionsByProps
  } = options;

  const RootI13nComponent = (props) => {
    const {
      children,
      i13nModel,
      isLeafNode,
      ...restProps
    } = props;

    const {
      i13nInstance: reactI13n,
      executeI13nEvent: executeEvent
    } = useReactI13nRoot(options);

    useEffect(() => {
      if (reactI13n) {
        plugins.forEach((plugin) => {
          reactI13n.plug(plugin);
        });
        reactI13n.createRootI13nNode();
      }

      return () => {
        reactI13n?.cleanUpPlugins();
      };
    }, [reactI13n, plugins]);

    const parentI13nNode = reactI13n?.getRootI13nNode();

    const { i13nNode } = useI13nNode({
      i13nInstance: reactI13n,
      i13nModel,
      isLeafNode,
      parentI13nNode
    });

    const contextValue = useMemo(() => ({
      executeEvent,
      i13nInstance: reactI13n,
      i13nNode,
      parentI13nNode
    }), [executeEvent, reactI13n, i13nNode, parentI13nNode]);

    return (
      <I13nContext.Provider
        value={contextValue}
      >
        <Component
          {...restProps}
          i13n={!skipUtilFunctionsByProps ? contextValue : undefined}
        >
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
