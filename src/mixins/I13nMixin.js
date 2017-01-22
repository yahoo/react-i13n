/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var ComponentSpecs = require('../libs/ComponentSpecs');

// export I13nMixin for BC, will recommend to get spec from ComponentSpecs directly instead of using mixin
module.exports = Object.assign({}, ComponentSpecs.pickSpecs(), ComponentSpecs.staticSpecs);
