/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window*/
var EventListener = require('react/lib/EventListener');

var uniqueId = 0;

// create a additional level on the original DOMNode, then we can show a trigger node on the DOMNode with correct position
function appendTriggerNode (DOMNode, triggerNode) {
    var DOMParent = DOMNode.parentNode;
    if (DOMParent) {
        DOMParent.removeChild(DOMNode);
    } else {
        DOMParent = document.body;
    }

    // create a new container and insert both original DOMNode and trigger node on it
    var newContainer = document.createElement('div');
    newContainer.appendChild(DOMNode);
    newContainer.appendChild(triggerNode);
    newContainer.style.position = 'relative';
    if (DOMNode.style.cssFloat) {
        newContainer.style.float = DOMNode.style.cssFloat;
    }
    triggerNode.style.position = 'absolute';
    triggerNode.style.top = 0;
    triggerNode.style.left = 0;
    DOMParent.appendChild(newContainer);
} 

function showDashboard (DOMNode, triggerNode, dashboard) {
    var offset = cumulativeOffset(triggerNode);
    dashboard.style.position = 'absolute';
    dashboard.style.top = (offset.top + 25) + 'px'; // top plus the trigger node height
    dashboard.style.left = offset.left + 'px';
    document.body.appendChild(dashboard);
}

function cumulativeOffset (DOMNode) {
    var rect = DOMNode.getBoundingClientRect();
    var elementLeft; // x
    var elementTop; // y
    var scrollTop = document.documentElement.scrollTop ?
        document.documentElement.scrollTop : document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft ?                   
        document.documentElement.scrollLeft : document.body.scrollLeft;
    elementTop = rect.top + scrollTop;
    elementLeft = rect.left + scrollLeft;
    return {
        top: elementTop,
        left: elementLeft
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
    dashboard.style.background = '#7300ff';
    dashboard.style.color = '#FFF';
    dashboard.style.fontsize = '14px';
    dashboard.style['max-width'] = '300px';
    dashboard.style['z-index'] = 11;
    dashboard.appendChild(dashboardContainer);

    // generate trigger node
    triggerNode.innerHTML = '...';
    triggerNode.style.fontsize = '12px';
    triggerNode.style.background = '#400090';
    triggerNode.style.color = '#FFF';
    triggerNode.style.padding = '2px';
    triggerNode.style.cursor = 'pointer';
    triggerNode.style['z-index'] = 10;
    triggerNode.style['line-height'] = 'normal';

    self.clickListener = EventListener.listen(triggerNode, 'click', function () {
        if (!self.isDashboardOn) {
            showDashboard (DOMNode, triggerNode, dashboard);
            self.isDashboardOn = true;
        } else {
            document.body.removeChild(dashboard);
            self.isDashboardOn = false;
        }
    });

    DOMNode.style.transition = 'border 0.05s';
    self.mouseOverListener = EventListener.listen(triggerNode, 'mouseover', function () {
        DOMNode.style.border = '5px solid #5a00c8';
    });
    self.mouseOutListener = EventListener.listen(triggerNode, 'mouseout', function () {
        DOMNode.style.border = null;
    });
    
    self.dashboard = dashboard;
    appendTriggerNode(DOMNode, triggerNode);
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
    if (this.isDashboardOn) {
        document.body.removeChild(this.dashboard);
    }
};

module.exports = DebugDashboard;
