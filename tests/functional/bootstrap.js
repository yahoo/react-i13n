/* global window */

window.Promise = require('promise');
window.Object.assign = require('object-assign');

window.React = require('react');
window.ReactDOM = require('react-dom');

window.I13nMixin = require('../../dist/mixins/I13nMixin');
window.ReactI13n = require('../../dist/libs/ReactI13n');

window.I13nAnchor = require('../../dist/components/I13nAnchor');
window.I13nButton = require('../../dist/components/I13nButton');
window.I13nDiv = require('../../dist/components/I13nDiv');

window.createI13nNode = require('../../dist/utils/createI13nNode');
window.clickHandler = require('../../dist/libs/clickHandler');
window.setupI13n = require('../../dist/utils/setupI13n');
window.I13nUtils = require('../../dist/mixins/I13nUtils');
