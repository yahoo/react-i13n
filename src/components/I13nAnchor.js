/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var createI13nNode = require('../utils/createI13nNode');

module.exports = createI13nNode('a', {
    isLeafNode: true,
    bindClickEvent: true,
    follow: true
});
