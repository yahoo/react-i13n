// @TODO, probably make it plugin so we don't need to included in main bundle if not used
import { useEffect } from 'react';
import ViewportDetector from './ViewportDetector';

const useViewportDetect = ({
  domNode,
  options
}) => {
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
};

export default useViewportDetect;
