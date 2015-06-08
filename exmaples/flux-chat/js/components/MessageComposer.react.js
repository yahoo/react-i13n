/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var ChatMessageActionCreators = require('../actions/ChatMessageActionCreators');
var React = require('react');
var ReactI13n = require('react-i13n').ReactI13n;
var createI13nNode = require('react-i13n').createI13nNode;

var ENTER_KEY_CODE = 13;

var MessageComposer = React.createClass({

  contextTypes: {
    parentI13nNode: React.PropTypes.object
  },

  propTypes: {
    threadID: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {text: ''};
  },

  render: function() {
    return (
      <textarea
        className="message-composer"
        name="message"
        value={this.state.text}
        onChange={this._onChange}
        onKeyDown={this._onKeyDown}
      />
    );
  },

  _onChange: function(event, value) {
    this.setState({text: event.target.value});
  },

  _onKeyDown: function(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      event.preventDefault();
      var text = this.state.text.trim();
      if (text) {
        ChatMessageActionCreators.createMessage(text, this.props.threadID);
      }
      this.setState({text: ''});
      // execute the custom event textInput here
      // createI13nNode will create a parent component with i13nNode, 
      // use context to get the i13n node generate from it's parent and pass into the handler function
      var i13nNode = this.context.parentI13nNode;
      ReactI13n.getInstance().execute('textInput', {i13nNode: i13nNode});
    }
    
  }

});

// create a i13n node for message composer, so that we can get the i13n node via context and fire event
module.exports = createI13nNode(MessageComposer, {i13nModel: {category: 'message-composer', action: 'compose'}});
