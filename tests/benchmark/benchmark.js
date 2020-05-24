/* start with benchmark */
const { Suite } = require('benchmark');
const createClass = require('create-react-class');
const { renderToString } = require('react-dom/server');
const { createElement } = require('react');
const createI13nNode = require('../../dist/utils/createI13nNode').default;
const I13nAnchor = require('../../dist/components/I13nAnchor').default;
const I13nButton = require('../../dist/components/I13nButton').default;

const PureReactComponent = createClass({
  autobind: false,
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
