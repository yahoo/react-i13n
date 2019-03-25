/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
module.exports = {
    // Core libraries
    I13nNode: require('./dist/libs/I13nNode'),
    ReactI13n: require('./dist/libs/ReactI13n'),

    // Utils
    createI13nNode: require('./dist/utils/createI13nNode'),
    setupI13n: require('./dist/utils/setupI13n'),

    // I13n Components
    I13nAnchor: require('./dist/components/I13nAnchor'),
    I13nButton: require('./dist/components/I13nButton'),
    I13nDiv: require('./dist/components/I13nDiv')
};
