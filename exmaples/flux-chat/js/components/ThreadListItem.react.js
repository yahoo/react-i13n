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

var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var React = require('react');
var cx = require('react/lib/cx');

// create a i13n node for li to track the click event
var createI13nNode = require('react-i13n').createI13nNode;
var I13nLi = createI13nNode('li', {
    isLeafNode: false,
    bindClickEvent: true,
    follow: false
});

var ReactPropTypes = React.PropTypes;

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string
  },

  render: function() {
    var thread = this.props.thread;
    var lastMessage = thread.lastMessage;
    return (
      <I13nLi
        className={cx({
          'thread-list-item': true,
          'active': thread.id === this.props.currentThreadID
        })}
        i13nModel={{action: 'switch-thread'}}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.name}</h5>
        <div className="thread-time">
          {lastMessage.date.toLocaleTimeString()}
        </div>
        <div className="thread-last-message">
          {lastMessage.text}
        </div>
      </I13nLi>
    );
  },

  _onClick: function() {
    ChatThreadActionCreators.clickThread(this.props.thread.id);
  }

});

module.exports = ThreadListItem;
