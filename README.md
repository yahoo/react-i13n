# react-i13n

[![npm version](https://badge.fury.io/js/react-i13n.svg)](http://badge.fury.io/js/react-i13n) [![Build Status](https://travis-ci.org/yahoo/react-i13n.svg?branch=master)](https://travis-ci.org/yahoo/react-i13n)

`react-i13n` provides a performant, scalable and pluggable approach to instrumenting your React application.

Typically, you have to manually add instrumentation code throughout your application, e.g., hooking up `onClick` handlers to the links you want to track. `react-i13n` provides a simplified approach by letting you define the data model you want to track and handling the beaconing for you.

`react-i13n` does this by building an [instrumentation tree](#i13n-tree) that mirrors your applications React component hierarchy. All you have to do it leverage our [React component or mixin](./docs/guides/integrateWithComponents.md) to denote which components should fire the tracking events.

## Features

* **i13n tree** - Automated [instrumentation tree](#i13n-tree) creation that mirrors your applications React component hierarchy.
* **React integration** - Provides a [createI13nNode](./docs/api/createI13nNode.md#createi13nnodecomponent-options) component and [I13nMixin](./docs/api/createI13nNode.md#i13nmixin) that easily integrate with your application.
* **Pluggable** - A pluggable interface lets you integrate any data analytics library (i.e. Google Analytics, Segment, etc). Take a look at the [available plugins](#available-plugins).
* **Performant** - Tracking data (`i13nModel`) can be a plain JS object or custom function. This means you can [dynamically change tracking data](./docs/guides/integrateWithComponents.md#dynamic-i13n-model) without causing unnecessary re-renders.
* **Adaptable** - If you are using an isomorphic framework (e.g. [Fluxible](http://fluxible.io)) to build your app, you can easily [change the tracking implementation](./docs/guides/createPlugins.md) on the server and client side. For example, to track page views, you can fire an http request on server and xhr request on the client.
* **Optimizable** - We provide an option to enable viewport checking for each `I13nNode`. Which means that data will only be beaconed when the node is in the viewport. This reduces the network usage for the user and provides better tracking details.

## Install

```
npm install react-i13n --save
```

## Usage

* Choose the appropriate [plugin](#available-plugins).
* Use the [setupI13n](./docs/api/setupI13n.md) utility to wrap your application component.
* Define your instrumentation data and [integrate with your components](./docs/guides/integrateWithComponents.md)
* (Optionally) follow the [event system](./docs/guides/eventSystem.md) if you want to fire events manually.

```js
var React = require('react');
var ReactI13n = require('react-i13n').ReactI13n;
var setupI13n = require('react-i13n').setupI13n;
var somePlugin = require('some-i13n-plugin'); // a plugin for a certain instrumentation mechanism

// create a i13n anchor for link tracking
// or you can use the mixin to track an existing component
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

## Available Plugins
* [react-i13n-ga](https://github.com/kaesonho/react-i13n-ga) - Google Analytics plugin

Or follow our guide and [create your own](./docs/api/createPlugins.md).


## I13n Tree
`react-i13n` builds the instrumentation tree by leveraging the undocumented React `context` feature and the `componentWillMount` life cycle event. Each component can define a `i13nModel` prop that defines the data it needs to track. This approach is more performant, as it means you do not need additional DOM manipulation when you want to collect the tracking data values for sending out beacons.

Since the i13n data is defined at each level. Whenever you want to get the `i13nModel` for a certain node, `react-i13n` will traverse back up the tree to merge all the `i13nModel` information in the hierarchy. Since the tree is already built, you do not need extra DOM access, which is cheap and efficient.

## Presentation
Take a look at [Rafael Martins' slides](http://www.slideshare.net/RafaelMartins21/instrumentation-talk-39547608) from a recent React meetup to understand more.

## Debugging
Add `i13n_debug=1` to the request url, you will get the i13n model for each `i13n node` directly shown on the page. It shows the information for each model data and where the data inherits from.

## Testing

### Unit

* `grunt unit` to run unit tests
* `grunt cover` to generate the istanbul coverage report

### Functional

* debug locally:
   * `grunt functional-debug`
   * check functional testing result on `http://127.0.0.1:9999/tests/functional/page.html`
* run functional test on `saucelabs`:
   * setup [sauce-connect](https://docs.saucelabs.com/reference/sauce-connect/)
   * `grunt functional`


## License

This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.
