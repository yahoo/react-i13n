## I13n Component
If the component has the i13n functionalities, we will mirror an `I13nNode` in `I13nTree` for that component, we provide two ways for you to generate an `I13nComponent`. You can use following `props` to set what we want the `I13nComponetn` act like.

 * `i13nModel` - the i13nModel data object or a dynamic function returns the data object.
 * `isLeafNode` - define if it's a leaf node or not, we will fire `created` event for every node when it's created, `isLeafNode` will help us to know if you want to do the action. e.g, you might only want to send out beacons to record links. 
 * `bindClickEvent` - define if want to bind a click handler or not.
 * `follow` - define if click handler need to redirect users to destination after sending beacon or not. You could set `follow=false` and the handler would send out beacon but will not redirect users.
 * you can pass all the `props` you need for the original component, we will pass them to the component.

### createI13nNode(component, options)
The `high order function` which integrate `I13nMixin`, it return a compoment with all I13n functionalities.
 * `component` - can be a string for native tags e.g., `a`, `button` or a react component you create
 * `options` - options object, it would be the default `props` of that I13nNode, you can also pass options with `props` to overwrite it.

For example, if you want to track the links, you will need to create anchor with `createI13nNode` and enable the click tracking.

```js
var createI13nNode = require('react-i13n').createI13nNode;
var I13nAnchor = createI13nNode('a', {
    isLeafNode: true,
    bindClickEvent: true,
    follow: true
});

<I13nAnchor i13nModel={i13nModel}>
    ...
</I13nAnchor>
```

### I13nMixin
Everything is done by the `i13nMixin`, which means you can add the `I13nMixin` into the component directly to give the component i13n functionalities.

```js
var I13nMixin = require('react-i13n').I13nMixin;
var Foo = React.createClass({
    mixins: [I13nMixin],
    // you can set the default props or pass them as props when you are using Foo
    getDefaultProps: {
        isLeafNode: false,
        bindClickEvent: false,
        follow: false
    }
    ...
});

// in template
<Foo i13nModel={i13nModel}>
    // will create a i13n node for Foo
    ...
</Foo>
```
