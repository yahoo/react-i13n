'use strict';

/* global window */

window.Promise = require('promise');
window.Object.assign = require('object-assign');

window.React = require('react');
window.ReactDOM = require('react-dom');
// TODO, this should be deprecated
window.createClass = require('create-react-class');

window.I13nAnchor = require('../../index').I13nAnchor;
window.I13nButton = require('../../index').I13nButton;
window.I13nDiv = require('../../index').I13nDiv;

window.createI13nNode = require('../../index').createI13nNode;
window.setupI13n = require('../../index').setupI13n;
window.clickHandler = require('../../dist/libs/clickHandler');
