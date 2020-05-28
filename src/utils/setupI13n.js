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

  const { displayName, skipUtilFunctionsByProps } = options;

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
      parentI13nNode,
    });

    // if (!skipUtilFunctionsByProps) {
    //   props.i13n = {
    //     executeEvent: this.executeI13nEvent.bind(this),
    //     getI13nNode: this.getI13nNode.bind(this),
    //     reactI13nInstance: this._reactI13nInstance
    //   };
    // }

    const propsToPass = {
      ...restProps,
      ...(!skipUtilFunctionsByProps ? {
        i13n: {

        }
      }: {})
    };

    const contextValue = {
      executeEvent,
      i13nInstance: reactI13n,
      i13nNode,
      parentI13nNode
    };

    return (
      <I13nContext.Provider value={contextValue}>
        <Component {...propsToPass}>
          {children}
        </Component>
      </I13nContext.Provider>
    );
  };

  RootI13nComponent.displayName = displayName || `RootI13n${getDisplayName(Component)}`;
  // class RootI13nComponent extends React.Component {
  //   constructor(props) {
  //     super(props);
  //     const reactI13n = new ReactI13n(options);
  //     this._reactI13nInstance = reactI13n;
  //     // we might have case to access reactI13n instance to execute event outside react components
  //     // assign reactI13n to window
  //     if (IS_CLIENT) {
  //       // put in componentDidMount will be too slow
  //       window._reactI13nInstance = this._reactI13nInstance;
  //     }
  //     plugins.forEach((plugin) => {
  //       reactI13n.plug(plugin);
  //     });
  //     reactI13n.createRootI13nNode();
  //   }
  //
  //   render() {
  //     const props = Object.assign({}, this.props);
  //     if (!options.skipUtilFunctionsByProps) {
  //       props.i13n = {
  //         executeEvent: this.executeI13nEvent.bind(this),
  //         getI13nNode: this.getI13nNode.bind(this),
  //         reactI13nInstance: this._reactI13nInstance
  //       };
  //     }
  //     return React.createElement(Component, props, props.children);
  //   }
  // }

  // const specs = pickSpecs({
  //   prototype: [
  //     'getChildContext',
  //     'executeI13nEvent',
  //     'getI13nNode',
  //     '_getReactI13n',
  //     '_getParentI13nNode'
  //   ],
  //   static: ['contextTypes', 'childContextTypes']
  // });

  // const componentName = getDisplayName(Component);
  //
  // augmentComponent(
  //   RootI13nComponent,
  //   specs.prototype,
  //   Object.assign(
  //     {
  //       displayName: options.displayName || `RootI13n${componentName}`
  //     },
  //     specs.static
  //   )
  // );

  hoistNonReactStatics(RootI13nComponent, Component);

  return RootI13nComponent;
}

export default setupI13n;
