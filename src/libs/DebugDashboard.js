/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window */
import { render } from 'react-dom';
import { listen } from 'subscribe-ui-event';
import DashboardContainer from '../components/debug/DashboardContainer';

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

function setupContainerPosition(DOMNode, container, dashboard) {
  const offset = cumulativeOffset(DOMNode);
  const left = offset.left + DOMNode.offsetWidth - 15;

  container.style.position = 'absolute';
  container.style['max-width'] = '300px';
  container.style.top = `${offset.top}px`;

  // adjust layout if dashboard is out of the viewport
  if (left + 305 > window.innerWidth) {
    dashboard.style.left = `${window.innerWidth - (left + 300) - 5}px`;
  }

  container.style.left = `${offset.left + DOMNode.offsetWidth - 15}px`;
  container.style['z-index'] = '10';
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
  const self = this;
  const DOMNode = i13nNode.getDOMNode();
  if (!DOMNode) {
    return;
  }
  if (checkHidden(DOMNode)) {
    return;
  }
  const container = document.createElement('div');
  container.id = `i13n-debug-${uniqueId}`;
  const triggerNode = document.createElement('span');
  const dashboard = document.createElement('div');
  const model = i13nNode.getMergedModel(true);

  // check if browser support classList API
  supportClassList = 'classList' in container;

  self.modelItemsListener = [];

  // compose model data
  if (!model.position) {
    model.position = {
      value: i13nNode.getPosition(),
      DOMNode
    };
  }

  // compose title
  render(<DashboardContainer title={i13nNode.getText()} model={model} DOMNode={DOMNode} />, dashboard);

  // compose model items
  // Object.keys(model).forEach((key) => {  //
  //   // set up scroll listener to show where the model data comes from
  //   if (model[key].DOMNode) {
  //     model[key].DOMNode.style.transition = 'border 0.05s';
  //     self.modelItemsListener.push(
  //       listen(dashboardItem, 'mouseover', () => {
  //         model[key].DOMNode.style.border = '4px solid #b39ddb';
  //       })
  //     );
  //     self.modelItemsListener.push(
  //       listen(dashboardItem, 'mouseout', () => {
  //         model[key].DOMNode.style.border = null;
  //       })
  //     );
  //   }
  //   dashboardContainer.appendChild(dashboardItem);
  // });

  // generate dashboard
  dashboard.style.position = 'relative';
  dashboard.style.display = 'none';
  dashboard.style.color = 'rgba(255,255,255,.87)';
  dashboard.style.fontsize = '14px';
  dashboard.style.width = '100%';
  dashboard.style['margin-top'] = '2px';
  dashboard.style['z-index'] = '1';
  dashboard.style['border-radius'] = '2px';
  // dashboard.appendChild(dashboardContainer);

  // generate trigger node
  triggerNode.innerHTML = '&#8964;';
  triggerNode.style.background = '#673ab7';
  triggerNode.style.color = 'rgba(255,255,255,.87)';
  triggerNode.style.padding = '0 3px';
  triggerNode.style.cursor = 'pointer';
  self.clickListener = listen(triggerNode, 'click', () => {
    if (dashboard.style.display === 'none') {
      dashboard.style.display = 'block';
      container.style['z-index'] = '11';
      if (supportClassList) {
        container.classList.add('active');
      }
    } else {
      dashboard.style.display = 'none';
      container.style['z-index'] = '10';
      if (supportClassList) {
        container.classList.remove('active');
      }
    }
  });

  DOMNode.style.transition = 'border 0.05s';
  self.mouseOverListener = listen(triggerNode, 'mouseover', () => {
    DOMNode.style.border = '4px solid #b39ddb';
  });
  self.mouseOutListener = listen(triggerNode, 'mouseout', () => {
    DOMNode.style.border = null;
  });

  container.appendChild(triggerNode);
  container.appendChild(dashboard);
  setupContainerPosition(DOMNode, container, dashboard);
  document.body.appendChild(container);
  uniqueId++;
  self.container = container;

  if (supportClassList) {
    document.documentElement.classList.add('i13n-debug-enabled');
  }
};

DebugDashboard.prototype.destroy = function () {
  this.clickListener && this.clickListener.remove();
  this.mouseOverListener && this.mouseOverListener.remove();
  this.mouseOutListener && this.mouseOutListener.remove();
  if (this.modelItemsListener) {
    this.modelItemsListener.forEach((listener) => {
      listener.remove();
    });
  }
  if (this.container) {
    document.body.removeChild(this.container);
  }
};

export default DebugDashboard;
