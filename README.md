# react-i13n

`react-i13n` provides a performant and scalable approach to instrumentation.

In most cases, you will have to manually add the code to what you want to track, e.g., you have to hook `onClick` to the links you want to track. `react-i13n` provide a convenient approach for you to do the instrumentation, all you have to do is to define the data model you want to beacon out.

Moreover, we provide a mechanism to build the `instrumentation tree`, typically you might have to manage the `instrumentation model data` you want and send out beacons separately, by using `react-i13n`, you have a better way to manage beacon data with an inheritance architecture, refer to [integrate with components](./docs/guides/integrateWithComponents.md) to see how do we get the benifit of `react-i13n`.

It's originated from [Rafael Martins](http://www.slideshare.net/RafaelMartins21/instrumentation-talk-39547608). More implement detail please refer to [Main Ideas](./docs/guides/mainIdeas.md) section.

## Features

* Provides [createI13nNode](./docs/api/createI13nNode.md#createi13nnodecomponent-options) and [I13nMixin](./docs/api/createI13nNode.md#i13nmixin) to generate components as an easy way to track the links.
* By integrating the tree architecture, you can get instrumentation data efficiently, and you can integrate the inherit architecture to manage them.
* `react-i13n` is pluggable to integrate any data analytics library into the same tree architecture. All that is needed is to implement the plugin and the handler functions which integrate with the libraries transport functions.
* `i13nModel` could be a plain object or a `dynamic function` with a proper `i13nModel` object return, which means you can dynamically change `i13nModel` data without causing re-render due to the `props` changes.
* All the components we provide are harmony with both server side and client side, If you are using isomorphic framework to build your app, you could get some events e.g., `pageview` on both server and client side, which means you could select a prefer way to handle the event.
* We integrate the viewport checking and set the status in each `I13nNode`, it could be used to know if you want to send out the data only when node is in viewport.

## Main Ideas
`react-i13n` utilizes the life cycle events provided by `React` to build an i13n tree that mirrors the React component hierarchy. This approach optimizes for performance by reducing the need to scrape the DOM for data before beaconing.

### I13n Tree
* `react-i13n` build the `I13n Tree` with `context` and life cycle event `componentWillMount`, we can define the `i13nModel` data we need. Which means we don't need additional DOM manipulation when we want to get `i13nModel` values for sending out beacons for the link.

### Inherit Architecture
* We can define i13n data for each level, whenever we want to get the `i13nModel` for certain node, it traverses back to the root and merge all the `i13nModel` information in the path. Since the tree is already built and we don't need extra DOM access, it should be pretty cheap and efficient. 

## Install

```
npm install react-i13n
```

## Usage

* Implement the [plugin](./docs/guides/createPlugins.md) for your preferred instrumentation mechanism.
* Use [setupI13n](./docs/api/setupI13n.md) to create a top level component.
* Define your instrumentation data and [integrate with your components](./docs/guides/integrateWithComponents.md)
* Follow the [event system](./docs/guides/eventSystem.md) if you want to fire events manually.

```js
var React = require('react/addons');
var ReactI13n = require('react-i13n').ReactI13n;
var setupI13n = require('react-i13n').setupI13n;
var somePlugin = require('some-i13n-plugin'); // a plugin for a certain instrumentation mechanism

// create a i13n anchor for link tracking
var createI13nNode = require('react-i13n').createI13nNode;
var I13nAnchor = createI13nNode('a', {
    isLeafNode: true,
    bindClickEvent: true,
    follow: true
});

var DemoApp = React.createClass({
    componentWillMount: function () {
        ReactI13n.getInstance().execute('pageview', {}); // fire a custom event
    },
    render: function () {
        ...
        <I13nAnchor href="http://foo.bar" i13nModel={{action: 'click', label: 'foo'}}>...</I13nAnchor> 
        // this link will be tracked, and the click event handlers provided the plugin will get the model data as 
        // {site: 'foo', action: 'click', label: 'foo'}
    }
});

var I13nDempApp = setupI13n(DemoApp, {
    rootModelData: {site: 'foo'},
    isViewportEnabled: true
}, [somePlugin]);
// then you could use I13nDemoApp to render you app
```

## Test

### Unit

* `grunt unit` to run simply unit test
* `grunt cover` to generate the coverage report

### Functional

* debug locally:
   * `grunt functional-debug`
   * check functional testing result on `http://127.0.0.1:9999/tests/functional/page.html`
* run functional test on `saucelabs`:
   * setup [sauce-connect](https://docs.saucelabs.com/reference/sauce-connect/)
   * `grunt functional`
