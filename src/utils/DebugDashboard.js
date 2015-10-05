/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window*/
var EventListener = require('fbjs/lib/EventListener');

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
    dashboardContainer.style.border = '#400090 1px solid';

    // compose title
    var dashboardTitle = document.createElement('li');
    dashboardTitle.style.background = '#400090';
    dashboardTitle.style.color = '#FFF';
    dashboardTitle.style.padding = '5px';
    dashboardTitle.style['white-space'] = 'nowrap';
    dashboardTitle.style['overflow'] = 'hidden';
    dashboardTitle.style['text-overflow'] = 'ellipsis';
    dashboardTitle.innerHTML = i13nNode.getText();
    dashboardContainer.appendChild(dashboardTitle);

    // compose model items
    Object.keys(model).forEach(function generateModelInfo(key) {
        var dashboardItem = document.createElement('li');
        dashboardItem.style.background = '#5a00c8';
        dashboardItem.style['border-top'] = '#400090 1px solid';
        dashboardItem.style.padding = '5px';
        dashboardItem.style['white-space'] = 'nowrap';
        dashboardItem.style['overflow'] = 'hidden';
        dashboardItem.style['text-overflow'] = 'ellipsis';
        dashboardItem.innerHTML = key + ' : ' + model[key].value + (model[key].DOMNode !== DOMNode ? ' (inherited)' : '');
      
        // set up scroll listener to show where the model data comes from 
        if (model[key].DOMNode) {
            model[key].DOMNode.style.transition = 'border 0.05s';
            self.modelItemsListener.push(EventListener.listen(dashboardItem, 'mouseover', function () {
                model[key].DOMNode.style.border = '5px solid #b493f5';
            }));
            self.modelItemsListener.push(EventListener.listen(dashboardItem, 'mouseout', function () {
                model[key].DOMNode.style.border = null;
            }));
        }
        dashboardContainer.appendChild(dashboardItem);
    }); 

    // generate dashboard
    dashboard.style.position = 'relative';
    dashboard.style.display = 'none';
    dashboard.style.background = '#7300ff';
    dashboard.style.color = '#FFF';
    dashboard.style.fontsize = '14px';
    dashboard.style.width = '100%';
    dashboard.style['margin-top'] = '2px';
    dashboard.style['z-index'] = '1';
    dashboard.appendChild(dashboardContainer);

    // generate trigger node
    triggerNode.innerHTML = '...';
    triggerNode.style.background = '#400090';
    triggerNode.style.color = '#FFF';
    triggerNode.style.padding = '2px';
    triggerNode.style.cursor = 'pointer';
    self.clickListener = EventListener.listen(triggerNode, 'click', function () {
        if ('none' === dashboard.style.display) {
            dashboard.style.display = 'block';
            container.style['z-index'] = '11';
        } else {
            dashboard.style.display = 'none';
            container.style['z-index'] = '10';
        }
    });

    DOMNode.style.transition = 'border 0.05s';
    self.mouseOverListener = EventListener.listen(triggerNode, 'mouseover', function () {
        DOMNode.style.border = '5px solid #5a00c8';
    });
    self.mouseOutListener = EventListener.listen(triggerNode, 'mouseout', function () {
        DOMNode.style.border = null;
    });
    
    container.appendChild(triggerNode);
    container.appendChild(dashboard);
    setupContainerPosition(DOMNode, container, dashboard);
    document.body.appendChild(container);
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
