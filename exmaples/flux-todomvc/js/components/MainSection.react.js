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
var TodoActions = require('../actions/TodoActions');
var TodoItem = require('./TodoItem.react');

// for customized usage, you can create a I13n component with createI13nNode
var createI13nNode = require('react-i13n').createI13nNode;
var I13nInput = createI13nNode('input', {
    isLeafNode: true,
    bindClickEvent: true,
    follow: false
});

var MainSection = React.createClass({

  propTypes: {
    allTodos: ReactPropTypes.object.isRequired,
    areAllComplete: ReactPropTypes.bool.isRequired
  },

  /**
   * @return {object}
   */
  render: function() {
    // This section should be hidden by default
    // and shown when there are todos.
    if (Object.keys(this.props.allTodos).length < 1) {
      return null;
    }

    var allTodos = this.props.allTodos;
    var todos = [];

    for (var key in allTodos) {
      todos.push(<TodoItem key={key} todo={allTodos[key]} />);
    }

    return (
      <section id="main">
        <I13nInput
          id="toggle-all"
          type="checkbox"
          onChange={this._onToggleCompleteAll}
          checked={this.props.areAllComplete ? 'checked' : ''}
            i13nModel={{action: 'toggle-all'}}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul id="todo-list">{todos}</ul>
      </section>
    );
  },

  /**
   * Event handler to mark all TODOs as complete
   */
  _onToggleCompleteAll: function() {
    TodoActions.toggleCompleteAll();
  }

});

module.exports = MainSection;
