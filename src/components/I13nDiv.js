/**
 * Copyright 2020, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import createI13nNode from '../utils/createI13nNode';

const I13nDiv = createI13nNode('div', {
  isLeafNode: false,
  bindClickEvent: false
});

export default I13nDiv;
