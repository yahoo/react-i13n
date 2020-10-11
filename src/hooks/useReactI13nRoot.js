/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { useCallback, useRef, useState } from 'react';

import ReactI13n from '../libs/ReactI13n';

import { IS_CLIENT, IS_PROD } from '../utils/variables';
import warnAndPrintTrace from '../utils/warnAndPrintTrace';

/*
 * @param {Object} options passed into ReactI13n
 * @param {Boolean} options.isViewportEnabled if enable viewport checking
 * @param {Object} options.displayName display name of the wrapper component
 * @param {Object} options.i13nNodeClass the i13nNode class, you can inherit it with your own functionalities
 * @param {Object} options.rootModelData model data of root i13n node
 */
const useReactI13n = (options) => {
  const i13nInstance = useRef();
  const [instance, setInstance] = useState();

  const setupI13nRoot = () => {
    if (!i13nInstance.current) {
      const reactI13n = new ReactI13n(options);
      reactI13n.i13nInstance = reactI13n;
      i13nInstance.current = reactI13n;

      setInstance(reactI13n);

      if (IS_CLIENT && !IS_PROD) {
        window._reactI13nInstance = reactI13n;
      }
    }
  };

  const executeI13nEvent = useCallback(
    (eventName, payload = {}, callback) => {
      let errorMessage = '';
      // payload.i13nNode = payload.i13nNode || this.getI13nNode();

      if (instance) {
        instance.execute(eventName, payload, callback);
      } else {
        /* istanbul ignore next */
        if (!IS_PROD) {
          errorMessage = 'ReactI13n instance is not found, please make sure you have setupI13n on the root component. ';
          if (!IS_CLIENT) {
            errorMessage
              += 'On server side, '
              + 'you can only execute the i13n event on the components under setupI13n, '
              + 'please make sure you are calling executeI13nEvent correctly';
          }
          warnAndPrintTrace(errorMessage);
        }
        callback?.();
      }
    },
    [instance]
  );

  setupI13nRoot();

  return {
    i13nInstance: i13nInstance.current,
    executeI13nEvent
  };
};

export default useReactI13n;
