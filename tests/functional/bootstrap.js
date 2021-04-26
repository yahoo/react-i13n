'use strict';

/* global window */
import React from 'react';
import ReactDOM from 'react-dom';

import {
  createI13nNode,
  getInstance,
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

window.I13nAnchor = I13nAnchor;
window.I13nButton = I13nButton;
window.I13nDiv = I13nDiv;
window.ReactI13n = ReactI13n;
window.getInstance = getInstance;

window.createI13nNode = createI13nNode;
window.setupI13n = setupI13n;
window.clickHandler = require('../../dist/libs/clickHandler').default;
