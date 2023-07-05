// @TODO, probably make it plugin so we don't need to included in main bundle if not used
import { useCallback } from 'react';
import { useInViewport } from 'react-in-viewport';

const useViewportDetect = ({
  executeEvent,
  node,
  ref,
  options
}) => {
  const onEnterViewport = useCallback(() => {
    node.setIsInViewport(true);
    executeEvent?.('enterViewport', { i13nNode: node });
  }, [executeEvent, node]);

  const onLeaveViewport = useCallback(() => {
    node.setIsInViewport(false);
  }, [node]);
  useInViewport(ref, options, { disconnectOnLeave: false }, {
    onEnterViewport,
    onLeaveViewport
  });
};

export default useViewportDetect;
