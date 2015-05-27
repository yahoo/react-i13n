## Event System

`react-i13n` communicate with `plugins` using it's own `event system`, which provides the ability for `react-i13n` to control and communicate with multiple plugin at the same time. It helps `react-i13n` to make

In other words, whenever you request plugins to take actions, you will need to fire the event instead of accessing the instrumentation library directly.

### Default Events
By default, `react-i13n` will fire following events:
 * `click` - happens when user click a `I13nNode` with `clickHandler`
 * `created` - happens when the `I13nComponent` is created
 * `enterViewport` - happens when the `isViewportEnabled` is true and the node enter the viewport

### reactI13n.execute(eventName, payload, callback)
Other than the default events, you can define the `eventHandlers` yourself and use `[$reactI13nInstance].execute` to execute that.
 * `eventName` - the event name
 * `payload` - the payload object you want to pass into the event handler
 * `callback` - the callback function after event is executed

```js
var React = require('react/addons');
var ReactI13n = require('react-i13n').ReactI13n;
var fooPlugin = {
    name: 'foo', 
    eventHandlers: {
        customEvent: function (payload, callback) {
            // handle the event here, typically you will use some beacon function to fire beacon
            callback();
        }
        ...
    }
}

var Foo = React.createClass({
    componentWillMount: function () {
        // whenever you define a event handler, you can fire a event for that.
        ReactI13n.getInstance().execute('customEvent', {payload}, function beaconCallback () {
            // do whatever after beaconing
        });
    }
    ...
});

var I13nFoo = setupI13n(Foo, {}, [fooPlugin]);

```
