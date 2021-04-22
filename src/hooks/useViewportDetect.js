// @TODO, probably make it plugin so we don't need to included in main bundle if not used
import { useCallback } from 'react';
import { useInViewport } from 'react-in-viewport';

const useViewportDetect = ({
  executeEvent,
  node
}) => {
  const onEnterViewport = useCallback(() => {
    node.setIsInViewport(true);
    executeEvent('enterViewport', {});
  }, [executeEvent, node]);

  const onLeaveViewport = useCallback(() => {
    node.setIsInViewport(false);
  }, [node]);

  useInViewport(node, {

  }, {}, {
    onEnterViewport,
    onLeaveViewport
  });
};

export default useViewportDetect;
