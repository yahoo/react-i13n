var React = require('react');
var ReactI13n = require('../libs/ReactI13n');
var IS_CLIENT = typeof window !== 'undefined';

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
            parentI13nNode: React.PropTypes.object,
            _reactI13nInstance: React.PropTypes.object
        })
    },
    
    childContextTypes: {
        i13n: React.PropTypes.shape({
            executeEvent: React.PropTypes.func,
            getI13nNode: React.PropTypes.func,
            parentI13nNode: React.PropTypes.object,
            _reactI13nInstance: React.PropTypes.object
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
                parentI13nNode: this._i13nNode,
                _reactI13nInstance: this._getReactI13n()
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
        var errorMessage = '';
        payload = payload || {};
        payload.i13nNode = payload.i13nNode || this.getI13nNode();
        if (reactI13nInstance) {
            reactI13nInstance.execute(eventName, payload, callback);
        } else {
            if ('production' !== process.env.NODE_ENV) {
                errorMessage = 'ReactI13n instance is not found, ' + 
                    'please make sure you have setupI13n on the root component. ';
                if (!IS_CLIENT) {
                    errorMessage += 'On server side, ' + 
                        'you can only execute the i13n event on the components under setupI13n, ' + 
                        'please make sure you are calling executeI13nEvent correctly';
                }
                console && console.warn && console.warn(errorMessage);
                console && console.trace && console.trace();
            }
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
        var globalReactI13n;
        if (IS_CLIENT) {
            globalReactI13n = window._reactI13nInstance;
        }
        return this._reactI13nInstance || 
            (this.context && this.context.i13n && this.context.i13n._reactI13nInstance) ||
            globalReactI13n;
    },

    /**
     * _getParentI13nNode, defualt will go to the rootI13nNode
     * @method _getParentI13nNode
     * @private
     * @return {Object} parent i13n node
     */
    _getParentI13nNode: function () {
        var reactI13n = this._getReactI13n();
        var context = this.context;
        return (context && context.i13n && context.i13n.parentI13nNode) || 
            (reactI13n && reactI13n.getRootI13nNode());
    }
}

module.exports = I13nUtils;
