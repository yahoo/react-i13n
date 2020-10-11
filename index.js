/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

module.exports = {
  // Core libraries
  I13nNode: require('./dist/libs/I13nNode').default,
  ReactI13n: require('./dist/libs/ReactI13n').default,
  getInstance: require('./dist/libs/ReactI13n').getInstance,

  // Utils
  createI13nNode: require('./dist/utils/createI13nNode').default,
  setupI13n: require('./dist/core/setupI13n').default,

  // I13n Components
  I13nAnchor: require('./dist/components/I13nAnchor').default,
  I13nButton: require('./dist/components/I13nButton').default,
  I13nDiv: require('./dist/components/I13nDiv').default
};
