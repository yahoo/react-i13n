var React = require('react');
var ReactI13n = require('../libs/ReactI13n');

/**
 * React.js I13n Utils Mixin
 * Provide functions for components to access the i13nNode
 * @class I13nUtils
 */
var I13nUtils = {

    contextTypes: {
        i13n: React.PropTypes.shape({
            executeEvent: React.PropTypes.func,
            getI13nNode: React.PropTypes.func,
            parentI13nNode: React.PropTypes.object
        })
    },
    
    childContextTypes: {
        i13n: React.PropTypes.shape({
            executeEvent: React.PropTypes.func,
            getI13nNode: React.PropTypes.func,
            parentI13nNode: React.PropTypes.object
        })
    },
    
    /**
     * getChildContext
     * @method getChildContext
     */
    getChildContext: function () {
        return {
            i13n: {
                executeEvent: this.executeI13nEvent,
                getI13nNode: this.getI13nNode,
                parentI13nNode: this._i13nNode
            }
        };
    },

    /**
     * execute the i13n event
     * @method executeI13nEvent
     * @param {String} eventName event name
     * @param {Object} payload payload object
     * @param {Function} callback function
     * @async
     */
    executeI13nEvent: function (eventName, payload, callback) {
        var reactI13nInstance = this._getReactI13n();
        payload = payload || {};
        payload.i13nNode = payload.i13nNode || this.getI13nNode();
        if (reactI13nInstance) {
            reactI13nInstance.execute(eventName, payload, callback);
        } else {
            callback && callback();
        }
    },

    /**
     * Get the nearest i13n node from the parent, default will go to the rootI13nNode
     * @method getI13nNode
     * @return {Object} i13n node
     */
    getI13nNode: function () {
        return this._i13nNode || this._getParentI13nNode();
    },

    /**
     * get React I13n instance
     * @method _getReactI13n
     * @private
     * @return {Object} react i13n instance
     */
    _getReactI13n: function () {
        return ReactI13n.getInstance();
    },

    /**
     * _getParentI13nNode, defualt will go to the rootI13nNode
     * @method _getParentI13nNode
     * @private
     * @return {Object} parent i13n node
     */
    _getParentI13nNode: function () {
        // https://twitter.com/andreypopp/status/578974316483608576, get the context from parent context
        // TODO remove this at react 0.14
        var context = (this._reactInternalInstance && this._reactInternalInstance._context) || this.context;
        return (context && context.i13n && context.i13n.parentI13nNode) || this._getReactI13n().getRootI13nNode();
    }
}

module.exports = I13nUtils;
