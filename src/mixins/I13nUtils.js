/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var ComponentSpecs = require('../libs/ComponentSpecs');
var specs = ComponentSpecs.pickSpecs({
    prototype: [
        'getChildContext',
        'executeI13nEvent',
        'getI13nNode',
        '_getReactI13n',
        '_getParentI13nNode',
    ],
    static: [
        'contextTypes',
        'childContextTypes'
    ]
});

// export I13nUtils for BC, will recommend to get spec from ComponentSpecs directly instead of using mixin
module.exports = Object.assign({}, specs.prototype, specs.static);
