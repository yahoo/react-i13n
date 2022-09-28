/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import {
  cloneElement,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { listen } from 'subscribe-ui-event';

import clickHandler from '../../libs/clickHandler';
import useDebugDashboard from '../../hooks/useDebugDashboard';
import useScanLinks from '../../hooks/useScanLinks';
import useViewportDetect from '../../hooks/useViewportDetect';

import I13nContext from './I13nContext';

const CoreComponent = (props) => {
  const {
    bindClickEvent,
    componentIsFunction,
    children,
    follow,
    i13nModel,
    scanLinks = {},
    shouldFollowLink,
    viewport,
  } = props;

  const {
    executeEvent,
    i13nNode,
    i13nInstance,
    parentI13nNode
  } = useContext(
    I13nContext
  );
  const domRef = useRef();
  const [DOMNode, setDOMNode] = useState();

  const { enable: scanLinksEnabled, tags } = scanLinks;

  // create event
  useEffect(() => {
    executeEvent?.('created', { i13nNode });
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
            follow,
          },
        });
      };
      clickEventListener = listen(DOMNode, 'click', handleClick);
    }

    return () => {
      clickEventListener?.remove();
    };
  }, [bindClickEvent, i13nNode, executeEvent, DOMNode]);

  // update modal if changes
  useEffect(() => {
    i13nNode?.updateModel(i13nModel);
  }, [i13nNode, i13nModel]);

  useScanLinks({
    enabled: scanLinksEnabled,
    executeEvent,
    i13nInstance,
    i13nNode,
    node: i13nNode?.getDOMNode(),
    shouldFollowLink,
    tags,
  });

  const ref = i13nInstance?.isViewportEnabled() ? domRef : {};

  useViewportDetect({
    viewport,
    executeEvent,
    ref,
    node: i13nNode,
  });

  useDebugDashboard({ node: i13nNode });

  // clean up
  useEffect(
    () => () => {
      if (parentI13nNode) {
        parentI13nNode.removeChildNode(i13nNode);
      }
    },
    [parentI13nNode, i13nNode]
  );

  return cloneElement(children, {
    [componentIsFunction ? 'innerRef' : 'ref']: (node) => {
      if (node) {
        i13nNode?.setDOMNode(node);
        domRef.current = node;
        setDOMNode(node);
      }
    },
  });
};

export default CoreComponent;
