/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window*/
var listen = require('subscribe-ui-event').listen;

var supportClassList = false;
var uniqueId = 0;

var textColor = 'rgba(255,255,255,.87)';
var baseItemStyle = {
    color: textColor,
    padding: '8px',
    'white-space': 'nowrap',
    overflow: 'hidden',
    'text-overflow': 'ellipsis'
};

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

function addStylesToNode (DOMNode, styles) {
    Object.keys(styles).forEach(function addStyle(key) {
        DOMNode.style[key] = styles[key];
    });
}

function createNode (tag) {
    return document.createElement(tag);
}

function setupContainerPosition (DOMNode, container, dashboard) {
    var offset = cumulativeOffset(DOMNode);
    var left = offset.left + DOMNode.offsetWidth - 15;

    addStylesToNode(container, {
        position: 'absolute',
        'max-width': '300px',
        top: offset.top + 'px',
        'z-index': '10'
    });

    // adjust layout if dashboard is out of the viewport
    if (left + 305 > window.innerWidth) {
        dashboard.style.left = (window.innerWidth - (left + 300) - 5) + 'px';
    }
    container.style.left = (offset.left + DOMNode.offsetWidth - 15) + 'px';
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
    var container = createNode('div');
    container.id = 'i13n-debug-' + uniqueId;
    var triggerNode = createNode('span');
    var dashboard = createNode('div');
    var model = i13nNode.getMergedModel(true);

    // check if browser support classList API
    supportClassList = 'classList' in container;

    self.modelItemsListener = [];

    // compose model data
    if (!model.position) {
        model.position = {
            value: i13nNode.getPosition(),
            DOMNode: DOMNode
        };
    }
    var dashboardContainer = createNode('ul');
    addStylesToNode(dashboardContainer, {
        margin: 0,
        'padding-left': 0,
        'box-shadow': '0 1px 4px 0 rgba(0,0,0,.28)'
    });

    // compose title
    var dashboardTitle = createNode('li');

    addStylesToNode(dashboardTitle, Object.assign({ background: '#673ab7' }, baseItemStyle));

    dashboardTitle.innerHTML = i13nNode.getText();
    dashboardContainer.appendChild(dashboardTitle);

    // compose model items
    Object.keys(model).forEach(function generateModelInfo(key) {
        var dashboardItem = createNode('li');
        var node = model[key].DOMNode;

        addStylesToNode(dashboardItem, Object.assign({
            background: '#d1c4e9',
            'border-top': '1px solid rgba(0,0,0,.12)',
        }, baseItemStyle));

        dashboardItem.innerHTML = key + ' : ' + model[key].value + (node !== DOMNode ? ' (inherited)' : '');

        // set up scroll listener to show where the model data comes from
        if (node) {
            node.style.transition = 'border 0.05s';
            self.modelItemsListener.push(listen(dashboardItem, 'mouseover', function mouseover() {
                node.style.border = '4px solid #b39ddb';
            }));
            self.modelItemsListener.push(listen(dashboardItem, 'mouseout', function mouseout() {
                node.style.border = null;
            }));
        }
        dashboardContainer.appendChild(dashboardItem);
    });

    // generate dashboard
    addStylesToNode(dashboard, {
        position: 'relative',
        display: 'none',
        color: textColor,
        fontsize: '14px',
        width: '100%',
        'margin-top': '2px',
        'z-index': '1',
        'border-radius': '2px'
    });

    dashboard.appendChild(dashboardContainer);

    // generate trigger node
    triggerNode.innerHTML = '&#8964;';

    addStylesToNode(triggerNode, {
        background: '#673ab7',
        color: textColor,
        padding: '0 3px',
        cursor: 'pointer'
    });

    self.clickListener = listen(triggerNode, 'click', function onClick() {
        if ('none' === dashboard.style.display) {
            addStylesToNode(dashboard, {
                display: 'block',
                'z-index': '12'
            });
            if (supportClassList) {
              container.classList.add('active');
            }
        } else {
            addStylesToNode(dashboard, {
                display: 'none',
                'z-index': '10'
            });
            if (supportClassList) {
              container.classList.remove('active');
            }
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

    if (supportClassList) {
      document.documentElement.classList.add('i13n-debug-enabled');
    }
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
