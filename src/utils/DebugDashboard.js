/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window*/
var listen = require('subscribe-ui-event').listen;

var uniqueId = 0;

function checkHidden (DOMNode) {
    if (DOMNode !== document) {
        var styles = window.getComputedStyle(DOMNode) || {};
        if ('none' === styles.display ||
            'hidden' === styles.visibility ||
            '0' === styles.opacity) {
            return true;
        } else {
            return checkHidden(DOMNode.parentNode);
        }
    } else {
        return false;
    }
}

function setupContainerPosition (DOMNode, container, dashboard) {
    var offset = cumulativeOffset(DOMNode);
    var left = offset.left + DOMNode.offsetWidth - 15;

    container.style.position = 'absolute';
    container.style['max-width'] = '300px';
    container.style.top = offset.top + 'px';

    // adjust layout if dashboard is out of the viewport
    if (left + 305 > window.innerWidth) {
        dashboard.style.left = (window.innerWidth - (left + 300) - 5) + 'px';
    }

    container.style.left = (offset.left + DOMNode.offsetWidth - 15) + 'px';
    container.style['z-index'] = '10';
}

function cumulativeOffset (DOMNode) {
    var top = 0;
    var rect = DOMNode.getBoundingClientRect();
    do {
        top += DOMNode.offsetTop  || 0;
        DOMNode = DOMNode.offsetParent;
    } while (DOMNode);
    return {
        top: top,
        left: rect.left
    };
}

/**
 * create debug message board for the i13n node
 * @class DebugDashboard
 * @param {Object} i13nNode the i13n node
 * @constructor
 */
var DebugDashboard = function DebugDashboard (i13nNode) {
    var self = this;
    var DOMNode = i13nNode.getDOMNode();
    if (!DOMNode) {
        return;
    }
    if (checkHidden(DOMNode)) {
        return;
    }
    var container = document.createElement('div');
    container.id = 'i13n-debug-' + uniqueId;
    var triggerNode = document.createElement('span');
    var dashboard = document.createElement('div');
    var model = i13nNode.getMergedModel(true);

    self.modelItemsListener = [];

    // compose model data
    if (!model.position) {
        model.position = {
            value: i13nNode.getPosition(),
            DOMNode: DOMNode
        };
    }
    var dashboardContainer = document.createElement('ul');
    dashboardContainer.style.margin = 0;
    dashboardContainer.style['padding-left'] = 0;
    dashboardContainer.style['box-shadow'] = '0 1px 4px 0 rgba(0,0,0,.28)';

    // compose title
    var dashboardTitle = document.createElement('li');
    dashboardTitle.style.background = '#673ab7';
    dashboardTitle.style.color = 'rgba(255,255,255,.87)';
    dashboardTitle.style.padding = '8px';
    dashboardTitle.style['white-space'] = 'nowrap';
    dashboardTitle.style['overflow'] = 'hidden';
    dashboardTitle.style['text-overflow'] = 'ellipsis';
    dashboardTitle.innerHTML = i13nNode.getText();
    dashboardContainer.appendChild(dashboardTitle);

    // compose model items
    Object.keys(model).forEach(function generateModelInfo(key) {
        var dashboardItem = document.createElement('li');
        dashboardItem.style.background = '#d1c4e9';
        dashboardItem.style.color = 'rgba(0,0,0,.87)';
        dashboardItem.style['border-top'] = 'rgba(0,0,0,.12) 1px solid';
        dashboardItem.style.padding = '8px';
        dashboardItem.style['white-space'] = 'nowrap';
        dashboardItem.style['overflow'] = 'hidden';
        dashboardItem.style['text-overflow'] = 'ellipsis';
        dashboardItem.innerHTML = key + ' : ' + model[key].value + (model[key].DOMNode !== DOMNode ? ' (inherited)' : '');

        // set up scroll listener to show where the model data comes from
        if (model[key].DOMNode) {
            model[key].DOMNode.style.transition = 'border 0.05s';
            self.modelItemsListener.push(listen(dashboardItem, 'mouseover', function mouseover() {
                model[key].DOMNode.style.border = '4px solid #b39ddb';
            }));
            self.modelItemsListener.push(listen(dashboardItem, 'mouseout', function mouseout() {
                model[key].DOMNode.style.border = null;
            }));
        }
        dashboardContainer.appendChild(dashboardItem);
    });

    // generate dashboard
    dashboard.style.position = 'relative';
    dashboard.style.display = 'none';
    dashboard.style.color = 'rgba(255,255,255,.87)';
    dashboard.style.fontsize = '14px';
    dashboard.style.width = '100%';
    dashboard.style['margin-top'] = '2px';
    dashboard.style['z-index'] = '1';
    dashboard.style['border-radius'] = '2px';
    dashboard.appendChild(dashboardContainer);
    
    // generate trigger node
    triggerNode.innerHTML = '&#8964;';
    triggerNode.style.background = '#673ab7';
    triggerNode.style.color = 'rgba(255,255,255,.87)';
    triggerNode.style.padding = '0 3px';
    triggerNode.style.cursor = 'pointer';
    self.clickListener = listen(triggerNode, 'click', function onClick() {
        if ('none' === dashboard.style.display) {
            dashboard.style.display = 'block';
            container.style['z-index'] = '11';
        } else {
            dashboard.style.display = 'none';
            container.style['z-index'] = '10';
        }
    });

    DOMNode.style.transition = 'border 0.05s';
    self.mouseOverListener = listen(triggerNode, 'mouseover', function mouseover() {
        DOMNode.style.border = '4px solid #b39ddb';
    });
    self.mouseOutListener = listen(triggerNode, 'mouseout', function mouseout() {
        DOMNode.style.border = null;
    });

    container.appendChild(triggerNode);
    container.appendChild(dashboard);
    setupContainerPosition(DOMNode, container, dashboard);
    document.body.appendChild(container);
    uniqueId++;
    self.container = container;
};

DebugDashboard.prototype.destroy = function () {
    this.clickListener && this.clickListener.remove();
    this.mouseOverListener && this.mouseOverListener.remove();
    this.mouseOutListener && this.mouseOutListener.remove();
    if (this.modelItemsListener) {
        this.modelItemsListener.forEach(function removeModelITemsListener(listener) {
            listener.remove();
        });
    }
    if (this.container) {
        document.body.removeChild(this.container);
    }
};

module.exports = DebugDashboard;
