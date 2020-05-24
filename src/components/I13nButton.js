/**
 * Copyright 2020, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import createI13nNode from '../utils/createI13nNode';

const I13nButton = createI13nNode('button', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true
});

export default I13nButton;
