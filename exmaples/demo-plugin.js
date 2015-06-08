/* globals window, document */

var eventContainer;

function createEventsContainer () {
    eventContainer = document.createElement('ul');
    eventContainer.style.position = 'fixed';
    eventContainer.style.maxHeight = '100%';
    eventContainer.style.top = 0;
    eventContainer.style.left = 0;
    eventContainer.style['overflow-y'] = 'scroll';
    eventContainer.style['list-style-type'] = 'none';
    eventContainer.style.margin = 0;
    eventContainer.style.padding = 0;
    eventContainer.style.color = '#FFF';
    eventContainer.style['background-color'] = '#30d3b6';
    eventContainer.style['font-size'] = '16px';
    document.body.appendChild(eventContainer);
};

function pushEvent (eventName, i13nNode) {
    var event = document.createElement('li');
    var i13nModel = i13nNode && i13nNode.getMergedModel();
    var eventDescription = eventName + '</br>';
    if (i13nModel) {
        i13nModel.position = i13nNode.getPosition();
        eventDescription += JSON.stringify(i13nModel);
    }
    event.innerHTML = eventDescription;
    event.style['background-color'] = '#258980';
    event.style.padding = '5px';
    event.style.margin = '5px';
    event.style.maxWidth = '300px';
    event.style['word-break'] = 'break-all';
    eventContainer.appendChild(event);
};

/**
 * Demo Plugin that simply shows the events on the screen
 */
var DemoI13nPlugin = {
    name: 'demo',
    eventHandlers: {
        /**
         * click
         * @method click
         * @param {Object} payload payload object
         * @param {Object} payload.i13nNode i13nNode
         * @param {Function} callback callback function
         */
        click: function (payload, callback) {
            pushEvent('click', payload.i13nNode); 
            callback && callback();
        },

        /**
         * pageview custom event
         * @method pageview
         * @param {Object} payload payload object
         * @param {Function} callback callback function
         */
        pageview: function (payload, callback) {
            pushEvent('pageview', null); 
            callback && callback();
        },
        
        /**
         * textInput custom event
         * @method textInput
         * @param {Object} payload payload object
         * @param {Object} payload.i13nNode i13nNode
         * @param {Function} callback callback function
         */
        textInput: function (payload, callback) {
            pushEvent('textInput', payload.i13nNode); 
            callback && callback();
        }
    }
};

createEventsContainer();
module.exports = DemoI13nPlugin;
