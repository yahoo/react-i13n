/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import createI13nNode from '../utils/createI13nNode';

const I13nAnchor = createI13nNode('a', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true
});

export default I13nAnchor;
