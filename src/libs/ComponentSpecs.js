/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { listen } from 'subscribe-ui-event';

import { IS_CLIENT, IS_PROD, IS_DEBUG_MODE } from '../utils/variables';
import clickHandler from './clickHandler';
import DebugDashboard from './DebugDashboard';
import I13nNode from './I13nNode';
import isUndefined from '../utils/isUndefined';
import ViewportDetector from './ViewportDetector';
import warnAndPrintTrace from '../utils/warnAndPrintTrace';

const debug = require('debug')('I13nComponent');

const DEFAULT_SCAN_TAGS = ['a', 'button'];
let pageInitViewportDetectionTimeout = null;

const staticSpecs = {
  ...(!IS_PROD
    ? {
      // remove propTypes for production build
      propTypes: {
        component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        // model: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        i13nModel: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        isLeafNode: PropTypes.bool,
        bindClickEvent: PropTypes.bool,
        follow: PropTypes.bool,
        scanLinks: PropTypes.shape({
          enable: PropTypes.bool,
          tags: PropTypes.array
        }),
        viewport: PropTypes.shape({
          margins: PropTypes.shape({
            usePercent: PropTypes.bool,
            top: PropTypes.number,
            bottom: PropTypes.number
          })
        })
      }
    }
    : {}),

  contextTypes: {
    i13n: PropTypes.shape({
      executeEvent: PropTypes.func,
      getI13nNode: PropTypes.func,
      parentI13nNode: PropTypes.object,
      _reactI13nInstance: PropTypes.object
    })
  },

  childContextTypes: {
    i13n: PropTypes.shape({
      executeEvent: PropTypes.func,
      getI13nNode: PropTypes.func,
      parentI13nNode: PropTypes.object,
      _reactI13nInstance: PropTypes.object
    })
  }
};

const prototypeSpecs = {
  /**
   * getChildContext
   * @method getChildContext
   */
  // @TODO, new context API
  getChildContext() {
    const self = this;
    // create a wrapper function and use apply here
    // to make sure this works with/without autobind, without generating warning msg
    return {
      i13n: {
        executeEvent: function executeEvent(...args) {
          return self.executeI13nEvent(...args);
        },
        getI13nNode: function getI13nNode(...args) {
          return self.getI13nNode(...args);
        },
        parentI13nNode: this._i13nNode,
        _reactI13nInstance: this._getReactI13n()
      }
    };
  },

  /**
   * componentWillUpdate
   * @method componentWillUpdate
   */
  // @TODO, UNSAFE_componentWillUpdate()
  // componentWillUpdate(nextProps) {
  //   const self = this;
  //
  //   if (nextProps && self._i13nNode) {
  //     self._i13nNode.updateModel(nextProps.i13nModel);
  //   }
  // },

  /**
   * componentDidMount
   * @method componentDidMount
   */
  componentDidMount() {
    const self = this;
    const reactI13n = self._getReactI13n();
    if (!reactI13n) {
      return;
    }

    // bind the click event for i13n component if it's enabled
    // if (self.props.bindClickEvent) {
    //   self.clickEventListener = listen(ReactDOM.findDOMNode(self), 'click', clickHandler.bind(self));
    // }

    const domNode = ReactDOM.findDOMNode(self);
    // self._i13nNode.setDOMNode(domNode);

    // enable viewport checking if enabled
    if (reactI13n.isViewportEnabled()) {
      self._viewportDetector = new ViewportDetector(domNode, self._getViewportOptions(), () => {
        self._handleEnterViewport();
      });
      if (this.pageInitViewportDetected) {
        self._viewportDetector.init();
      } else {
        self._triggerPageInitViewportDetection();
      }
    }
    // self.executeI13nEvent('created', {});
    // if (self.props.scanLinks && self.props.scanLinks.enable) {
    //   self._scanLinks();
    // }

    // if (IS_DEBUG_MODE) {
    //   self._debugDashboard = new DebugDashboard(self._i13nNode);
    // }
  },

  /**
   * componentDidUpdate
   * @method componentDidUpdate
   */
  // componentDidUpdate() {
  //   if (IS_DEBUG_MODE) {
  //     this._debugDashboard && this._debugDashboard.destroy();
  //     this._debugDashboard = new DebugDashboard(this._i13nNode);
  //   }
  // },

  /**
   * componentWillMount
   * @method componentWillMount
   */
  componentWillMount() {
    if (pageInitViewportDetectionTimeout) {
      clearTimeout(pageInitViewportDetectionTimeout);
    }
    // this._createI13nNode();
    this._i13nNode.setReactComponent(this);
  },

  /**
   * componentWillUnmount
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    if (!this._getReactI13n()) {
      return;
    }
    // const parentI13nNode = this._getParentI13nNode();
    // if (parentI13nNode) {
    //   parentI13nNode.removeChildNode(this._i13nNode);
    // }

    // if (this.clickEventListener) {
    //   this.clickEventListener.remove();
    // }

    if (this._getReactI13n().isViewportEnabled()) {
      this._viewportDetector.unsubscribeAll();
    }

    // remove debug dashboard
    // if (IS_DEBUG_MODE) {
    //   this._debugDashboard && this._debugDashboard.destroy();
    // }

    // this._removeSubComponentsListenersAndDebugDashboards();
  },

  /**
   * execute the i13n event
   * @method executeI13nEvent
   * @param {String} eventName event name
   * @param {Object} payload payload object
   * @param {Function} callback function
   * @async
   */
  executeI13nEvent(eventName, payload = {}, callback) {
    const reactI13nInstance = this._getReactI13n();
    let errorMessage = '';
    payload.i13nNode = payload.i13nNode || this.getI13nNode();

    if (reactI13nInstance) {
      reactI13nInstance.execute(eventName, payload, callback);
    } else {
      /* istanbul ignore next */
      if (!IS_PROD) {
        errorMessage = 'ReactI13n instance is not found, please make sure you have setupI13n on the root component. ';
        if (!IS_CLIENT) {
          errorMessage
            += 'On server side, '
            + 'you can only execute the i13n event on the components under setupI13n, '
            + 'please make sure you are calling executeI13nEvent correctly';
        }
        warnAndPrintTrace(errorMessage);
      }
      callback && callback();
    }
  },

  /**
   * Get the nearest i13n node from the parent, default will go to the rootI13nNode
   * @method getI13nNode
   * @return {Object} i13n node
   */
  getI13nNode() {
    return this._i13nNode || this._getParentI13nNode();
  },

  _getViewportOptions() {
    const options = {};
    const margins = this.props.viewport && this.props.viewport.margins;
    if (margins) {
      options.margins = margins;
    }
    const reactI13n = this._getReactI13n();
    if (reactI13n.getScrollableContainerDOMNode) {
      const domNode = reactI13n.getScrollableContainerDOMNode();
      if (domNode) {
        options.target = domNode;
      }
    }
    return options;
  },

  /**
   * get React I13n instance
   * @method _getReactI13n
   * @private
   * @return {Object} react i13n instance
   */
  _getReactI13n() {
    let globalReactI13n;
    if (typeof window !== 'undefined') {
      globalReactI13n = window._reactI13nInstance;
    }
    return (
      this._reactI13nInstance
      || (this.context && this.context.i13n && this.context.i13n._reactI13nInstance)
      || globalReactI13n
    );
  },

  /**
   * _getParentI13nNode, defualt will go to the rootI13nNode
   * @method _getParentI13nNode
   * @private
   * @return {Object} parent i13n node
   */
  _getParentI13nNode() {
    const reactI13n = this._getReactI13n();
    const { context } = this;
    return (context && context.i13n && context.i13n.parentI13nNode) || (reactI13n && reactI13n.getRootI13nNode());
  },

  /**
   * scan links, if user enable it, scan the links(users can define the tags they want) with componentDidMount,
   * and this function will find all the elements by getElementsByTagName, then
   * 1. create i13n node
   * 2. bind the click event
   * 3. fire created event
   * 4. (if enabled) create debug node for it
   * @method _scanLinks
   * @private
   */
  // _scanLinks() {
  //   const self = this;
  //   const DOMNode = ReactDOM.findDOMNode(self);
  //   let foundElements = [];
  //   const reactI13n = self._getReactI13n();
  //   const scanTags = (self.props.scanLinks && self.props.scanLinks.tags) || DEFAULT_SCAN_TAGS;
  //   if (!DOMNode) {
  //     return;
  //   }
  //   self._subI13nComponents = [];

    // find all links
    // scanTags.forEach((tagName) => {
    //   const collections = DOMNode.getElementsByTagName(tagName);
    //   if (collections) {
    //     foundElements = foundElements.concat([...collections]);
    //   }
    // });

    // for each link
    // 1. create a i13n node
    // 2. bind the click event
    // 3. fire created event
    // 4. (if enabled) create debug node for it
  //   foundElements.forEach((element) => {
  //     const I13nNodeClass = reactI13n.getI13nNodeClass() || I13nNode;
  //     const i13nNode = new I13nNodeClass(self._i13nNode, {}, true, reactI13n.isViewportEnabled());
  //     i13nNode.setDOMNode(element);
  //     const subThis = {
  //       props: {
  //         href: element.href,
  //         follow: true
  //       },
  //       getI13nNode: function getI13nNodeForScannedNode() {
  //         return i13nNode;
  //       }
  //     };
  //
  //     subThis._shouldFollowLink = self._shouldFollowLink.bind(subThis);
  //     subThis.executeI13nEvent = self.executeI13nEvent.bind(self);
  //
  //     self._subI13nComponents.push({
  //       componentClickListener: listen(element, 'click', clickHandler.bind(subThis)),
  //       debugDashboard: IS_DEBUG_MODE ? new DebugDashboard(i13nNode) : null,
  //       domElement: element,
  //       i13nNode
  //     });
  //     self._getReactI13n().execute('created', { i13nNode });
  //   });
  // },

  /**
   * _shouldFollowLink, provide a hook to check followLink.
   * It check if component implement its own shouldFollowLink() method,
   * otherwise return props.follow
   * @method _shouldFollowLink
   * @private
   */
  // _shouldFollowLink() {
  //   if (!isUndefined(this.shouldFollowLink)) {
  //     return this.shouldFollowLink(this.props);
  //   }
  //   return this.props.follow;
  // },

  /**
   * _subComponentsViewportDetection, will be executed by viewport mixin
   * @method _subComponentsViewportDetection
   * @private
   */
  _subComponentsViewportDetection() {
    const self = this;
    if (self._subI13nComponents && self._subI13nComponents.length > 0) {
      self._subI13nComponents.forEach((subI13nComponent) => {
        subI13nComponent.viewportDetector = new ViewportDetector(
          subI13nComponent.domElement,
          self._getViewportOptions(),
          () => {
            subI13nComponent.i13nNode.setIsInViewport(true);
            self._getReactI13n().execute('enterViewport', {
              i13nNode: subI13nComponent.i13nNode
            });
          }
        );
        subI13nComponent.viewportDetector.init();
      });
    }
  },

  // /**
  //  * remove all click listeners and debug dashboards
  //  * @method _removeSubComponentsListenersAndDebugDashboards
  //  * @private
  //  */
  // _removeSubComponentsListenersAndDebugDashboards() {
  //   const self = this;
  //   if (self._subI13nComponents && self._subI13nComponents.length > 0) {
  //     self._subI13nComponents.forEach((subI13nComponent) => {
  //       subI13nComponent.componentClickListener.remove();
  //       if (subI13nComponent.viewportDetector) {
  //         subI13nComponent.viewportDetector.unsubscribeAll();
  //       }
  //       if (subI13nComponent.debugDashboard) {
  //         subI13nComponent.debugDashboard.destroy();
  //       }
  //     });
  //   }
  // },

  /**
   * _handleEnterViewport for react-viewport
   * @method _handleEnterViewport
   * @private
   */
  _handleEnterViewport() {
    this._i13nNode.setIsInViewport(true);
    this.executeI13nEvent('enterViewport', {});
    this._subComponentsViewportDetection();
  },

  /**
   * Debounce and trigger the page-init viewport detection
   * @method _triggerPageInitViewportDetection
   * @private
   */
  _triggerPageInitViewportDetection() {
    const self = this;
    // clear the timeout until latest node is mounted, then trigger the viewport detection
    clearTimeout(pageInitViewportDetectionTimeout);
    pageInitViewportDetectionTimeout = setTimeout(() => {
      self._pageInitViewportDetection();
      this.pageInitViewportDetected = true;
    }, 500);
  },

  /**
   * page-init viewport detection
   * @method _pageInitViewportDetection
   * @private
   */
  _pageInitViewportDetection() {
    debug('page init viewport detection');
    const reactI13n = this._getReactI13n();
    const rootI13nNode = reactI13n && reactI13n.getRootI13nNode && reactI13n.getRootI13nNode();
    if (!rootI13nNode) {
      // return if rootI13nNode not found in any case
      // known issue for unit testing, this happens when the next test already happens
      return;
    }
    // we don't have react component for root node, start from it's children
    rootI13nNode.getChildrenNodes().forEach((childNode) => {
      childNode.getReactComponent().recursiveDetectViewport(true);
    });
  },

  /**
   * _createI13nNode
   * @method _createI13nNode
   * @private
   */
  _createI13nNode() {
    // check if reactI13n is initialized successfully, otherwise return
    const self = this;
    const parentI13nNode = self._getParentI13nNode();
    const reactI13n = self._getReactI13n();
    const I13nNodeClass = (reactI13n && reactI13n.getI13nNodeClass()) || I13nNode;
    // TODO @kaesonho remove BC for model
    self._i13nNode = new I13nNodeClass(
      parentI13nNode,
      self.props.i13nModel || self.props.model,
      self.isLeafNode(),
      reactI13n && reactI13n.isViewportEnabled()
    );
  },

  /**
   * recursively detect viewport
   * @method recursiveDetectViewport
   * @params {Boolean} parentInViewport
   */
  recursiveDetectViewport(parentInViewport) {
    const self = this;
    self._viewportDetector.init(!parentInViewport);
    self._i13nNode.getChildrenNodes().forEach((childNode) => {
      const reactComponent = childNode.getReactComponent();
      if (reactComponent) {
        reactComponent.recursiveDetectViewport(self._viewportDetector.isEnteredViewport());
      }
    });
  },

  /**
   * isLeafNode
   * @method isLeafNode
   * @return {Boolean} if the node is a leaf link node
   */
  isLeafNode() {
    return this.props.isLeafNode || false;
  }
};

/**
 * Pick prototype and static specs for components, return all if specs is not set
 * @method pickSpecs
 * @param (Object) specs picking specs
 * @param (Object) specs.prototype picking prototype specs
 * @param (Object) specs.static picking static specs
 * @returns picked specs
 */
const pickSpecs = function pickSpecs(specs = {}) {
  const picked = {
    prototype: {},
    static: {}
  };

  if (!specs.prototype) {
    picked.prototype = prototypeSpecs;
  } else {
    specs.prototype.forEach((spec) => {
      picked.prototype[spec] = prototypeSpecs[spec];
    });
  }

  if (!specs.static) {
    picked.static = staticSpecs;
  } else {
    specs.static.forEach((spec) => {
      picked.static[spec] = staticSpecs[spec];
    });
  }

  return picked;
};

export default pickSpecs;
