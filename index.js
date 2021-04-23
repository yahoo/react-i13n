/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

module.exports = {
  // Core libraries
  createI13nNode: require('./dist/core/createI13nNode').default,
  getInstance: require('./dist/core/ReactI13n').getInstance,
  I13nNode: require('./dist/core/I13nNode').default,
  ReactI13n: require('./dist/core/ReactI13n').default,
  setupI13n: require('./dist/core/setupI13n').default,

  // I13n Components
  I13nAnchor: require('./dist/components/I13nAnchor').default,
  I13nButton: require('./dist/components/I13nButton').default,
  I13nContext: require('./dist/components/core/I13nContext').default,
  I13nDiv: require('./dist/components/I13nDiv').default
};
