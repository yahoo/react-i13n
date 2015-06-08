/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var React = require('react');
var ReactPropTypes = React.PropTypes;
var ReactI13n = require('react-i13n').ReactI13n;
var createI13nNode = require('react-i13n').createI13nNode;

var ENTER_KEY_CODE = 13;

var TodoTextInput = React.createClass({

  contextTypes: {
    parentI13nNode: React.PropTypes.object
  },

  propTypes: {
    className: ReactPropTypes.string,
    id: ReactPropTypes.string,
    placeholder: ReactPropTypes.string,
    onSave: ReactPropTypes.func.isRequired,
    value: ReactPropTypes.string
  },

  getInitialState: function() {
    return {
      value: this.props.value || ''
    };
  },

  /**
   * @return {object}
   */
  render: function() /*object*/ {
    return (
      <input
        className={this.props.className}
        id={this.props.id}
        placeholder={this.props.placeholder}
        onBlur={this._save}
        onChange={this._onChange}
        onKeyDown={this._onKeyDown}
        value={this.state.value}
        autoFocus={true}
      />
    );
  },

  /**
   * Invokes the callback passed in as onSave, allowing this component to be
   * used in different ways.
   */
  _save: function() {
    this.props.onSave(this.state.value);
    this.setState({
      value: ''
    });
  },

  /**
   * @param {object} event
   */
  _onChange: function(/*object*/ event) {
    this.setState({
      value: event.target.value
    });
  },

  /**
   * @param  {object} event
   */
  _onKeyDown: function(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      // execute the custom event textInput here
      // createI13nNode will create a parent component with i13nNode, 
      // use context to get the i13n node generate from it's parent and pass into the handler function
      var i13nNode = this.context.parentI13nNode;
      ReactI13n.getInstance().execute('textInput', {i13nNode: i13nNode});
      this._save();
    }
  }

});

// create a i13n node for todo text input and define default i13n model value
module.exports = createI13nNode(TodoTextInput, {i13nModel: {category: 'todo-text-input', action: 'input'}});
