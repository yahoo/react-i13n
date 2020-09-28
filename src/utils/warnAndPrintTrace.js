/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { IS_PROD, IS_TEST } from './variables';

const warnAndPrintTrace = (errorMessage) => {
  if (!IS_PROD) {
    console && console.warn && console.warn(errorMessage);
    !IS_TEST && console && console.trace && console.trace();
  }
};

export default warnAndPrintTrace;
