## Integrating with Components

This guide will show you how to take an existing component and modify it to leverage `react-i13n`. This assumes you already [setup your application](../api/setupI13n.md) and are leveraging a [plugin](./createPlugins.md).

### Existing component

Say you have a video player component and you want to track each link, you might need to have `onClick` for each links, for example:

```js
class Player extends React.Component {
  trackButton = (category, action) => {
    // assume "beacon" is some beaconing function
    beacon(category, action);
  };

  trackExternalLink = (category, action, url) => {
    // typically you will redirect users to the destination page after beaconing
    beacon(category, action, function onBeaconFinish() {
      document.location = url;
    });
  };

  render() {
    return (
      <div>
        ...
        <button onClick="this.trackButton('VideoPlayer', 'Play')">Play</button>
        <button onClick="this.trackButton('VideoPlayer', 'Download')">Download</button>
        <a
          onClick="this.trackExternalLink('VideoPlayer', 'More', 'http://some.more.link')"
          href="http://some.more.link"
        >
          More
        </a>
      </div>
    );
  }
}

// in some other component
<Player></Player>;
```

### Replace with I13n Components

A better approach might be to remove the `onClick` hooks everywhere and use the [createI13nNode](../api/createI13nNode.md) component to create i13n components to do the same thing.

```js
import { createI13nNode } from 'react-i13n';

const I13nAnchor = createI13nNode('a', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true
});
const I13nButton = createI13nNode('button', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: false // it's only interaction here, we don't want to redirect users to the destination page, set it as false
});

class Player extends React.Component {
    ...
  render() {
    return (
      <div>
        ...
        <I13nButton i13nModel={{category: 'VideoPlayer', action: 'Play'}}>Play</I13nButton>
        <I13nButton i13nModel={{category: 'VideoPlayer', action: 'Download'}}>Download</I13nButton>
        <I13nAnchor i13nModel={{category: 'VideoPlayer', action: 'More'}} href="http://some.more.link">More</I13nAnchor>
      </div>
    );
  }
};

// in some other component
<Player></Player>
```

### Integrate with Parent Nodes

This is better, however, you will notice that you have to put `category: VideoPlayer` on each node, which is verbose and not very [DRY](http://en.wikipedia.org/wiki/Don%27t_repeat_yourself). Now lets integrate the i13n inherit architecture, which will create an i13n parent node for them to define the `category`.

Below we use [createI13nNode](../api/createI13nNode.md) to wrap `Player` as an `I13nNode`, then define `category: VideoPlayer`.

```js
import { createI13nNode } from 'react-i13n';

const I13nAnchor = createI13nNode('a', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true
});
const I13nButton = createI13nNode('button', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: false
});
class Player extends React.Component {
  ...
  render() {
    return (
      <div>
        ...
        <I13nButton i13nModel={{action: 'Play'}}>Play</I13nButton>
        <I13nButton i13nModel={{action: 'Download'}}>Download</I13nButton>
        <I13nAnchor i13nModel={{action: 'More'}} href="http://some.more.link">More</I13nAnchor>
      </div>
    );
  }
};

Player = createI13nNode(Player);

// in some other component
<Player i13nModel={{category: 'VideoPlayer'}}></Player>
```

The player component is now an i13nNode and you can pass i13nModel here, all the links inside will apply this model data.

### Dynamic I13n Model

If you need to pass video title as `label`, instead of static data, you will need to dynamically generate label value, here you can pass in a `function` as `i13nModel`.

```js
import { createI13nNode } from 'react-i13n';

const I13nAnchor = createI13nNode('a', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true
});
const I13nButton = createI13nNode('button', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: false
});
class Player extends React.Component {
    ...
  getPlayI13nModel() {
    return {
      action: 'Play',
      label: this.getVideoTitle();
    }
  };

  render() {
    return (
      <div>
        ...
        <I13nButton i13nModel={this.getPlayI13nModel}>Play</I13nButton>
        <I13nButton i13nModel={{action: 'Download'}}>Download</I13nButton>
        <I13nAnchor i13nModel={{action: 'More'}} href="http://some.more.link">More</I13nAnchor>
      </div>
    );
  }
};

Player = createI13nNode(Player);

// in some other component
<Player i13nModel={{category: 'VideoPlayer'}}></Player>
```

### I13n Wrapper in Components

Sometimes you just want to group links in your template instead of creating a component with i13n functionalities, you can create a simple component and pass `i13nModel` data directly. This way, you can easily group links with some shared i13n data definition.

- Please note that since we integrate the feature of `parent-based context`, with `dev` env, react will generate warning like

```js
Warning: owner-based and parent-based contexts differ (values: [object Object] vs [object Object]) for key (parentI13nNode) while mounting I13nAnchor (see: http://fb.me/react-context-by-parent)
```

- This feature can only be used after `react-0.13`, if you are using an older version, you will have to create the component as mentioned above [example](#integrate-with-parent-nodes).

```js
import { createI13nNode } from 'react-i13n';

const I13nDiv = createI13nNode('div', {
  isLeafNode: false,
  bindClickEvent: false,
  follow: false
});

<I13nDiv i13nModel={parentI13nModel}>// the i13n node inside will inherit the model data of its parent</I13nDiv>;
```

```js
import { createI13nNode } from 'react-i13n';

const I13nAnchor = createI13nNode('a', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: true
});
var I13nButton = createI13nNode('button', {
  isLeafNode: true,
  bindClickEvent: true,
  follow: false
});

// this will be used to group the i13n data without creating a i13nNode
const I13nDiv = createI13nNode('div', {
  isLeafNode: false,
  bindClickEvent: false,
  follow: false
});

class Player extends React.Component {
  ...
  getPlayI13nModel() {
      return {
          action: 'Play',
          label: this.getVideoTitle();
      }
  };
  render() {
    return (
      <I13nDiv i13nModel={{category: 'VideoPlayer'}}>
        ...
        <I13nButton i13nModel={this.getPlayI13nModel}>Play</I13nButton>
        <I13nButton i13nModel={{action: 'Download'}}>Download</I13nButton>
        <I13nAnchor i13nModel={{action: 'More'}} href="http://some.more.link">More</I13nAnchor>
      </I13nDiv>
    );
  }
};

// in some other component
<Player></Player>
```

### Default I13n Components

For common usage, the following components are available, you can require them without generating them every time. These setting can be overwritten by `props`.

| Component      | isLeafNode | bindClickEvent | follow |
| -------------- | ---------- | -------------- | ------ |
| **I13nAnchor** | true       | true           | true   |
| **I13nButton** | true       | true           | true   |
| **I13nDiv**    | false      | false          | false  |
