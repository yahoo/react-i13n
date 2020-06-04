/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { useEffect, useRef } from 'react';

import useScanLinks from '../../hooks/useScanLinks';
import useDebugDashboard from '../../hooks/useDebugDashboard';

const I13nComponent = (props) => {
  const {
    executeEvent,
    i13nInstance,
    node,
    scanLinks = {}
    follow
  } = props;

  const debugDashboard = useRef();

  const { enable: scanLinksEnabled, tags } = scanLinks;

  useScanLinks({
    enabled: scanLinksEnabled,
    executeEvent,
    i13nInstance,
    node,
    shouldFollowLink: follow,
    tags
  });

  useDebugDashboard({ node });
};

export default I13nComponent;
