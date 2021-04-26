/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { createContext } from 'react';

const I13nContext = createContext({
  executeEvent: (name, payload, callback) => { callback?.(); },
  i13nInstance: null,
  i13nNode: null,
  parentI13nNode: null
});

I13nContext.displayName = 'ReactI13nContext';

export default I13nContext;
