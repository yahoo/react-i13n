## I13n Component

If your component needs i13n functionality, we will mirror an `I13nNode` in `I13nTree` for that component, we provide two ways for you to generate an `I13nComponent`. You can use following `props` to set what we want the `I13nComponetn` act like.

 * `i13nModel` - the i13nModel data object or a dynamic function returns the data object.
 * `isLeafNode` - define if it's a leaf node or not, we will fire `created` event for every node when it's created, `isLeafNode` will help us to know if you want to do the action. e.g, you might only want to send out beacons to record links. 
 * `bindClickEvent` - define if want to bind a click handler or not.
 * `follow` - define if click handler need to redirect users to destination after sending beacon or not. You could set `follow=false` and the handler would send out beacon but will not redirect users.
 * `scanLinks` - other than replacing all links component, we provide a options to do that automatically, please note that this should be only used for some case you cannot replace the component, e.g., you are using `dangerouslySetInnerHTML` or the component has the dependencies of other projects. 
 * `scanLinks.enable` - enable the auto links-scanning procedure.
 * `scanLinks.tags` - an array to define the tags you want it be be scanned, default to be `['a', 'button']`.
 * you can pass all the `props` you need for the original component, we will pass them to the component.

### createI13nNode(component, options)
The `high order component` integrates the functionalities of i13n, it returns a decorated component with full I13n functionality.

 * `component` - can be a string for native tags e.g., `a`, `button` or a react component you create
 * `defaultProps` - defaultProps object, it would be the default `props` of that I13nNode, you can also pass options with `props` to overwrite it.
 * `options` - options object
 * `options.displayName` - display name of the wrapper component, will fallback to `I13n` + original display name
 * `options.refToWrappedComponent` - ref to the wrapped component, then you can use `{i13nComponent}.refs[options.refToWrappedComponent]` to access the wrapped component.
 * `options.skipUtilFunctionsByProps` - true to prevent i13n util function to be passed via `props.i13n`

For example, if you want to enable link tracking, you will need to create an anchor with the `createI13nNode` and enable the click tracking.

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

If you have a use case where you cannot replace the links with `I13n Component`, i.e, when using `dangerouslySetInnerHTML`. You can integrate the `scanLinks` options to automatically track these links. This option should be used sparingly since it can create additional DOM manipulations. 

```js
var createI13nNode = require('react-i13n').createI13nNode;
var I13nDiv = createI13nNode('div', {
    isLeafNode: false,
    bindClickEvent: false,
    follow: false,
    scanLinks: {
        enable: true,
        tags: ['a', 'button']
    }
});

<I13nDiv i13nModel={i13nModel}>
    // the links inside will be scanned and tracked
    // the i13n data will apply the i13nModel from I13nDiv
    <a href="/foo">foo</a>
    <button>bar</button>
</I13nDiv>
```

### Utils Functions

You will get i13n util functions via `this.props.i13n` by using `createI13nNode`, more detail please refer to [util functions](../guide/utilFunctions.md).
