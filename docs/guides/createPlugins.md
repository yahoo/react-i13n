## Creating a plugin

A valid plugin must contain:

 * `name` - the plugin name
 * `eventHandlers` - handlers functions for the events, typically in the eventHandler function we would send out a tracking beacon, now `react-i13n` has `click`, `created` and `enterViewport`, you can define the events you need and implement the handlers function, e.g., `pageview`.

All of the `eventHandlers` will receive a `payload` object and a `callback` function. By default, in payload you will get:

 * `payload.I13nNode` - the I13n node related to the event, then you could use the APIs provided by [I13nNode](../api/I13nNode.md) to get the information you need. It's typically used for default events e.g., `click`, `created`, `enterViewport`. For custom events, if you don't pass `I13nNode`, the default will be the root I13nNode.
 * `payload.env` - `server` or `client`, some events e.g., `pageview` will fire on both server and client side, you can define the prefer way you want to handle the beacon.

```js
var ReactI13n = require('react-i13n').ReactI13n;
// define the plugin
var fooPlugin = {
    name: 'foo',
    eventHandlers: {
        click: function (payload, callback) {
            // click handlers
        },
        pageview: function (payload, callback) {
            if ('client' === payload.env) {
                // client side pageview handlers
            } else {
                // server side pageview handlers
            }
        },
        created: function (payload, callback) {
            // created handlers
        }
    }
};

```
Then we can plug the `plugin` with [setupI13n](../api/setupI13n.md).
