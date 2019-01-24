/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const ComponentSpecs = require('../libs/ComponentSpecs');

const specs = ComponentSpecs.pickSpecs();

// export I13nMixin for BC, will recommend to use createI13nNode instead of using mixin
module.exports = Object.assign({}, specs.prototype, specs.static);
