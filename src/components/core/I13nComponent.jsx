/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { useContext, useEffect, useRef } from 'react';

import useDebugDashboard from '../../hooks/useDebugDashboard';
import useScanLinks from '../../hooks/useScanLinks';

import I13nContext from './I13nContext';

const I13nComponent = (props) => {
  const {
    children,
    follow,
    i13nModel,
    isLeafNode,
    scanLinks = {}
  } = props;

  const {
    executeEvent,
    i13nNode,
    i13nInstance,
    parentI13nNode
  } = useContext(I13nContext);

  const {
    enable: scanLinksEnabled,
    tags
  } = scanLinks;

  // create event
  useEffect(() => {
    executeEvent('created', {});
  }, []);

  useScanLinks({
    enabled: scanLinksEnabled,
    executeEvent,
    i13nInstance,
    node: i13nNode.getDOMNode(),
    shouldFollowLink: follow,
    tags
  });

  useDebugDashboard({ node: i13nNode });

  return children;
};

export default I13nComponent;
