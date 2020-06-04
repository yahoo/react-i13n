import { useLayoutEffect, useRef } from 'react';

import { IS_DEBUG_MODE } from '../utils/variables';
import DebugDashboard from '../libs/DebugDashboard';

const useDebugDashboard = ({
  node
}) => {
  const debugDashboard = useRef();

  useLayoutEffect(() => {
    if (IS_DEBUG_MODE) {
      debugDashboard.current = new DebugDashboard(node);
    }

    return () => {
      if (debugDashboard.current) {
        debugDashboard.current.destroy();
      }
    };
  });
};

export default useDebugDashboard;
