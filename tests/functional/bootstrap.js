'use strict';

/* global window */

window.Promise = require('promise');
window.Object.assign = require('object-assign');

window.React = require('react');
window.ReactDOM = require('react-dom');
window.createClass = require('create-react-class');

window.I13nAnchor = require('../../dist/components/I13nAnchor').default;
window.I13nButton = require('../../dist/components/I13nButton').default;
window.I13nDiv = require('../../dist/components/I13nDiv').default;

window.createI13nNode = require('../../dist/utils/createI13nNode').default;
window.clickHandler = require('../../dist/libs/clickHandler').default;
window.setupI13n = require('../../dist/utils/setupI13n').default;
