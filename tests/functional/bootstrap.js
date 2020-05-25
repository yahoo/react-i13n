'use strict';

/* global window */
import React from 'react';
import ReactDOM from 'react-dom';
import createClass from 'create-react-class';

import {
  createI13nNode,
  I13nAnchor,
  I13nButton,
  I13nDiv,
  ReactI13n,
  setupI13n
} from '../../index';

if (!global.Promise) {
  global.Promise = require('promise');
}

if (!Object.assign) {
  Object.assign = require('object-assign');
}

window.React = React;
window.ReactDOM = ReactDOM;
// TODO, this should be deprecated
window.createClass = createClass;

window.I13nAnchor = I13nAnchor;
window.I13nButton = I13nButton;
window.I13nDiv = I13nDiv;
window.ReactI13n = ReactI13n;

window.createI13nNode = createI13nNode;
window.setupI13n = setupI13n;
window.clickHandler = require('../../dist/libs/clickHandler').default;
