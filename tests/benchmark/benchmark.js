/* use production mode for benchmark */
const fs = require('fs');
const resolve = require('resolve');

const resolveOpts = {
  basedir: process.cwd()
};
const reactPath = fs.realpathSync(resolve.sync('react', resolveOpts));
const reactDomPath = fs.realpathSync(resolve.sync('react-dom/server', resolveOpts));
const reactDistPath = fs.realpathSync(resolve.sync('react/dist/react.min', resolveOpts));
const reactDistDomPath = fs.realpathSync(
  resolve.sync('react-dom/dist/react-dom-server.min', resolveOpts)
);

require(reactDistPath);
require.cache[reactPath] = require.cache[reactDistPath];
require(reactDistDomPath);
require.cache[reactDomPath] = require.cache[reactDistDomPath];

/* start with benchmark */
const { Suite } = require('benchmark');
const createClass = require('create-react-class');
const { renderToString } = require('react-dom/server');
const { createElement } = require('react');
const createI13nNode = require('../../dist/utils/createI13nNode');
const I13nMixin = require('../../dist/mixins/I13nMixin');
const I13nAnchor = require('../../dist/components/I13nAnchor');
const I13nButton = require('../../dist/components/I13nButton');

const PureReactComponent = createClass({
  autobind: false,
  render() {
    return createElement('a', this.props, this.props.children);
  }
});

const PureReactComponentWithI13n = createClass({
  autobind: false,
  mixins: [I13nMixin],
  render() {
    return createElement('a', this.props, this.props.children);
  }
});

const createLinkChildren = function (Element, count) {
  const links = [];
  for (let i = 0; i < count; i++) {
    links.push(
      createElement(
        Element,
        {
          key: i,
          href: `http://www.yahoo.com/${i}`
        },
        `text ${i}`
      )
    );
  }
  return createElement('div', {}, links);
};

const I13nA = createI13nNode('a');

new Suite()
  .add('link-without-react-component', () => {
    renderToString(createLinkChildren('a', 1));
  })
  .add('link-wrapped-with-react-component', () => {
    renderToString(createLinkChildren(PureReactComponent, 1));
  })
  .add('link-wrapped-with-react-component-with-i13n-mixin', () => {
    renderToString(createLinkChildren(PureReactComponentWithI13n, 1));
  })
  .add('link-wrapped-with-react-component-with-i13n-high-order-component', () => {
    renderToString(createLinkChildren(I13nA, 1));
  })
  .add('i13nAnchor', () => {
    renderToString(createLinkChildren(I13nAnchor, 1));
  })
  .add('i13nButton', () => {
    renderToString(createLinkChildren(I13nButton, 1));
  })
  // add listeners
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log(`Fastest is ${this.filter('fastest').map('name')}`);
  })
  .run({ async: true });
