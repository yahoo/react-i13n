/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import {
  useEffect,
  useState
} from 'react';
import { findDOMNode } from 'react-dom';
import { listen } from 'subscribe-ui-event';

import { IS_DEBUG_MODE } from '../utils/variables';
import clickHandler from '../libs/clickHandler';
import DebugDashboard from '../libs/DebugDashboard';

import I13nNode from '../core/I13nNode';

const DEFAULT_SCAN_TAGS = ['a', 'button'];

/**
 * Scan matched tags and
 * 1. create i13n node
 * 2. bind the click event
 * 3. fire created event
 * 4. (if enabled) create debug node for it
 */
const useScanLinks = ({
  enabled,
  executeEvent,
  i13nInstance,
  i13nNode: parentI13nNode,
  node,
  shouldFollowLink,
  tags = DEFAULT_SCAN_TAGS
}) => {
  const [subI13nComponents, setSubI13nComponents] = useState([]);
  if (!enabled) {
    return;
  }

  useEffect(() => {
    const DOMNode = findDOMNode(node);
    if (!DOMNode) {
      return;
    }
    let foundElements = [];

    // find all links
    tags.forEach((tagName) => {
      const collections = DOMNode.getElementsByTagName(tagName);
      if (collections) {
        foundElements = foundElements.concat([...collections]);
      }
    });

    // for each link
    // 1. create a i13n node
    // 2. bind the click event
    // 3. fire created event
    // 4. (if enabled) create debug node for it
    const newSubI13nComponents = foundElements.map((element) => {
      const I13nNodeClass = i13nInstance.getI13nNodeClass() || I13nNode;
      const subI13nNode = new I13nNodeClass(parentI13nNode, {}, true, i13nInstance.isViewportEnabled());

      subI13nNode.setDOMNode(element);

      const handleClick = (e) => {
        clickHandler(e, {
          executeEvent,
          i13nNode: subI13nNode,
          props: {
            href: element.href,
            follow: true
          },
          shouldFollowLink
        });
      };
      i13nInstance.execute('created', { i13nNode: subI13nNode });

      return {
        componentClickListener: listen(element, 'click', handleClick),
        debugDashboard: IS_DEBUG_MODE ? new DebugDashboard(subI13nNode) : null,
        domElement: element,
        i13nNode: subI13nNode
      };
    });

    if (newSubI13nComponents) {
      setSubI13nComponents(newSubI13nComponents);
    }

    return () => {
      subI13nComponents.forEach((subI13nComponent) => {
        subI13nComponent?.componentClickListener?.remove();
        subI13nComponent?.viewportDetector?.unsubscribeAll();
        subI13nComponent?.debugDashboard?.destroy();
      });
    };
  }, [tags, node, parentI13nNode, shouldFollowLink]);

  return {
    subI13nComponents
  };
};

export default useScanLinks;
