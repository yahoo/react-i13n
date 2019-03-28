/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window */
import React, { Suspense, lazy } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { subscribe } from 'subscribe-ui-event';

// Dashboard only used in client side, could safely defered load
const Dashboard = lazy(() => import(/* webpackChunkName: "i13n-debug-dashboard" */ '../components/debug/Dashboard'));

let supportClassList = false;
let uniqueId = 0;

function checkHidden(DOMNode) {
  if (DOMNode !== document) {
    const styles = window.getComputedStyle(DOMNode) || {};
    if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
      return true;
    }
    return checkHidden(DOMNode.parentNode);
  }
  return false;
}

const changeClassName = (target, action, className) => {
  if (target && supportClassList) {
    target.classList[action](className);
  }
};

function setupContainerPosition(DOMNode, container) {
  if (!DOMNode || !container) {
    return;
  }

  const offset = cumulativeOffset(DOMNode);
  const left = offset.left + DOMNode.offsetWidth - 15;

  if (left + 305 > window.innerWidth) {
    const dashboad = container.querySelectorAll('.dashboard')[0];
    if (dashboad) {
      dashboad.style.left = `${window.innerWidth - (left + 300) - 5}px`;
    }
  }

  container.style.top = `${offset.top}px`;
  container.style.left = `${offset.left + DOMNode.offsetWidth - 15}px`;
}

function cumulativeOffset(DOMNode) {
  let top = 0;
  const rect = DOMNode.getBoundingClientRect();
  do {
    top += DOMNode.offsetTop || 0;
    DOMNode = DOMNode.offsetParent;
  } while (DOMNode);
  return {
    top,
    left: rect.left
  };
}

/**
 * create debug message board for the i13n node
 * @class DebugDashboard
 * @param {Object} i13nNode the i13n node
 * @constructor
 */
const DebugDashboard = function DebugDashboard(i13nNode) {
  const DOMNode = i13nNode.getDOMNode();
  if (!DOMNode || checkHidden(DOMNode)) {
    return;
  }

  // Basic container style
  const container = document.createElement('div');
  container.id = `i13n-debug-${uniqueId}`;
  container.style.position = 'absolute';
  container.style['max-width'] = '300px';
  container.style['z-index'] = '10';

  // const dashboard = document.createElement('div');
  const model = i13nNode.getMergedModel(true);

  // check if browser support classList API
  supportClassList = 'classList' in container;

  // compose model data
  if (!model.position) {
    model.position = {
      value: i13nNode.getPosition(),
      DOMNode
    };
  }

  const handleContainerShow = () => {
    container.style['z-index'] = '11';
    changeClassName(container, 'add', 'active');
  };

  const handleContainerHide = () => {
    container.style['z-index'] = '10';
    changeClassName(container, 'remove', 'active');
  };

  const handleOnMount = () => {
    setupContainerPosition(DOMNode, container);
    this.resizeHandler = subscribe('resize', () => {
      setupContainerPosition(DOMNode, container);
    });
  };

  render(
    React.createElement(
      Suspense,
      { fallback: null },
      React.createElement(Dashboard, {
        onMount: handleOnMount,
        title: i13nNode.getText(),
        model,
        DOMNode,
        onShow: handleContainerShow,
        onHide: handleContainerHide
      })
    ),
    container,
    () => {
      uniqueId++;
      DOMNode.style.transition = 'border 0.05s';
      document.body.appendChild(container);
      this.container = container;
    }
  );

  changeClassName(document.documentElement, 'add', 'i13n-debug-enabled');
};

DebugDashboard.prototype.destroy = function () {
  if (this.resizeHandler) {
    this.resizeHandler.unsubscribe();
  }
  if (this.container) {
    unmountComponentAtNode(this.container);
    document.body.removeChild(this.container);
  }
};

export default DebugDashboard;
