/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { useRef } from 'react';

import { IS_DEBUG_MODE } from '../utils/variables';
import DebugDashboard from '../libs/DebugDashboard';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

const useDebugDashboard = ({
  node
}) => {
  const debugDashboard = useRef();

  useIsomorphicLayoutEffect(() => {
    if (IS_DEBUG_MODE) {
      debugDashboard.current = new DebugDashboard(node);
    }

    return () => {
      if (debugDashboard.current) {
        debugDashboard.current.destroy();
      }
    };
  }, [node]);
};

export default useDebugDashboard;
