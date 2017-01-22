/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var ComponentSpecs = require('../libs/ComponentSpecs');

module.exports = Object.assign({}, ComponentSpecs.pickSpecs([
    'getChildContext',
    'executeI13nEvent',
    'getI13nNode',
    '_getReactI13n',
    '_getParentI13nNode',
]), {
    contextTypes: ComponentSpecs.staticSpecs.contextTypes,
    childContextTypes: ComponentSpecs.staticSpecs.childContextTypes
});
