## Util Functions

We provides util functions for you to easily access the resource provided by `react-i13n`, you have two options to get the util functions,

- `props` - When you are using [setupI13n](../api/setupI13n.md) or [createI13nNode](../api/createI13nNode.md), we will pass util functions via `this.props.i13n`. Please note that starts from `2.3.0`, you can pass `skipUtilFunctionsByProps=true` to prevent `props.i13n` being passed to fix the unknown props warning from `react@15.x`.
- `context` - You can always define `contextTypes` and access util functions via `context`, i.e., `this.context.i13n`.

```js
// with setupI13n or createI13nNode, you will automatically get this.props.i13n for i13n util functions
class DemoComponent extends React.Component {
  displayName = 'DemoComponent';
  render() {
    // this.props.i13n.getI13nNode() to access the i13nNode created by createI13nNode
    // this.props.i13n.executeEvent() to execute i13n event
  }
};

const I13nDemoComponent = createI13nNode(DemoComponent);
```

```js

// For components without `setupI13n` and `createI13nNode`, you can still get i13n functions via context
class DemoComponent extends React.Component {
  displayName = 'DemoComponent',;
  contextTypes = {
    i13n: React.PropTypes.object
  };
  render() {
    // this.context.i13n.getI13nNode() to access the nearest i13nNode created by createI13nNode
    // this.context.i13n.executeEvent() to execute i13n event
  }
});

```

### getI13nNode()

get the nearest `i13nNode` created by `createI13nNode`

### executeEvent(eventName, payload, callback)

execute the i13n event, so that you don't need to call `ReactI13n.getInstance().execute`, it also get the i13nNode and add into payload for you

```js
import React, { Component } from 'react';

class DemoComponent extends Component {
  componentDidMount() {
    // executeEvent will find the i13nNode and append to the payload for you, which means the final payload will be the i13nNode plus the payload you defined,
    // i.e., { i13nNode: [theI13nNode], foo: 'bar' }
    this.props.i13n.executeEvent('someEventName', { foo: 'bar' },
    function callback() {
      // callback
    });
  }
});

const I13nDemoComponent = createI13nNode(DemoComponent);
```
