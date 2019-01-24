/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const createI13nNode = require('../utils/createI13nNode');

module.exports = createI13nNode('button', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true
});
