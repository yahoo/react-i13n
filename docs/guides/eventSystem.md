## Event System

`react-i13n` communicates with `plugins` using it's own `event system`. This provides the ability for `react-i13n` to control and communicate with multiple plugins at the same time. In other words, whenever you request plugins to take actions, you will need to fire the event instead of accessing the instrumentation library directly.

### Default Events
By default, `react-i13n` will fire the following events:
 * `click` - happens when the user clicks a `I13nNode` component with a `clickHandler`
 * `created` - happens when the `I13nComponent` is created
 * `enterViewport` - happens when the `isViewportEnabled` is true and the node enters the viewport

### executeI13nEvents(eventName, payload, callback)
Other than the default events, you can define the `eventHandlers` yourself and use `executeI13nEvents` (provided by [I13nUtils](../api/I13nUtils.md)) to execute that.
 * `eventName` - the event name
 * `payload` - the payload object you want to pass into the event handler
 * `callback` - the callback function after event is executed

```js
var React = require('react');
var ReactI13n = require('react-i13n').ReactI13n;
var I13nUtils = require('react-i13n').I13nUtils;
var fooPlugin = {
    name: 'foo',
    eventHandlers: {
        customEvent: function (payload, callback) {
            // handle the event here, typically you will use some beacon function to fire the beacon
            callback();
        }
        ...
    }
}

var Foo = React.createClass({
    mixins: [I13nUtils],
    componentWillMount: function () {
        // whenever you define a event handler, you can fire an event for that.
        this.executeI13nEvent('customEvent', {payload}, function beaconCallback () {
            // do whatever after beaconing
        });
    }
    ...
});

var I13nFoo = setupI13n(Foo, {}, [fooPlugin]);

```

