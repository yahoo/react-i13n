/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { createContext } from 'react';

import type { ExecuteEvent, ContextType } from './types';

const defaultContext: ContextType = {
  executeEvent: (name, payload, callback) => { callback?.(); },
  i13nInstance: null,
  i13nNode: null,
  parentI13nNode: null,
};

const I13nContext = createContext(defaultContext);

I13nContext.displayName = 'ReactI13nContext';

export default I13nContext;
