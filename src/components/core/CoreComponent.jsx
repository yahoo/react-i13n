/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { listen } from 'subscribe-ui-event';

import clickHandler from '../../libs/clickHandler';
import useDebugDashboard from '../../hooks/useDebugDashboard';
import useScanLinks from '../../hooks/useScanLinks';

import I13nContext from './I13nContext';

const CoreComponent = (props) => {
  const {
    bindClickEvent,
    children,
    follow,
    i13nModel,
    isLeafNode,
    scanLinks = {},
    shouldFollowLink
  } = props;

  const {
    executeEvent,
    i13nNode,
    i13nInstance,
    parentI13nNode
  } = useContext(I13nContext);
  const [DOMNode, setDOMNode] = useState();

  const {
    enable: scanLinksEnabled,
    tags
  } = scanLinks;

  // create event
  useEffect(() => {
    executeEvent('created', {});
  }, []);

  // auto bind click event
  useEffect(() => {
    let clickEventListener;

    if (bindClickEvent && DOMNode) {
      const handleClick = (e) => {
        clickHandler(e, {
          executeEvent,
          i13nNode,
          props: {
            follow
          }
        });
      };
      clickEventListener = listen(DOMNode, 'click', handleClick);
    }

    return () => {
      clickEventListener?.unsubscribe();
    };
  }, [bindClickEvent, i13nNode, executeEvent, DOMNode]);

  // update modal if changes
  useEffect(() => {
    i13nNode?.updateModel(i13nModel);
  }, [i13nNode, i13nModel])

  useScanLinks({
    enabled: scanLinksEnabled,
    executeEvent,
    i13nInstance,
    i13nNode,
    node: i13nNode?.getDOMNode(),
    shouldFollowLink,
    tags
  });

  useDebugDashboard({ node: i13nNode });

  // clean up
  useEffect(() => {
    return () => {
      if (parentI13nNode) {
        parentI13nNode.removeChildNode(i13nNode);
      }
    };
  }, [parentI13nNode, i13nNode]);

  return (
    <span
      ref={(node) => {
        if (node) {
          i13nNode?.setDOMNode(node);
          setDOMNode(node);
        }
      }}
    >
      {children}
    </span>
  );
};

export default CoreComponent;
