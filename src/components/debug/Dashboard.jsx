import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import TriggerNode from './TriggerNode';
import DashboardContainer from './DashboardContainer';

const DISPLAY_NONE = 'none';
const DISPLAY_BLOCK = 'block';

const Dashboard = (props) => {
  const {
    onShow, onHide, title, model, DOMNode, onMount
  } = props;
  const [display, setDisplay] = useState(DISPLAY_NONE);

  const style = {
    position: 'relative',
    display,
    color: 'rgba(255,255,255,.87)',
    fontSize: '14px',
    width: '100%',
    marginTop: '2px',
    zIndex: 1,
    borderRadius: '2px'
  };

  const handleOnClick = useCallback(() => {
    if (display === DISPLAY_NONE) {
      setDisplay(DISPLAY_BLOCK);
      onShow();
    } else {
      setDisplay(DISPLAY_NONE);
      onHide();
    }
  });

  const handleMouseOver = useCallback(() => {
    if (DOMNode) {
      DOMNode.style.border = '4px solid #b39ddb';
    }
  });

  const handleMouseOut = useCallback(() => {
    if (DOMNode) {
      DOMNode.style.border = null;
    }
  });

  useEffect(() => {
    onMount();
  }, []);

  return (
    <div onFocus={handleMouseOver} onMouseOver={handleMouseOver} onBlur={handleMouseOut} onMouseOut={handleMouseOut}>
      <TriggerNode onClick={handleOnClick} />
      <div style={style} className="dashboard">
        <DashboardContainer title={title} model={model} DOMNode={DOMNode} />
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  DOMNode: PropTypes.node.isRequired,
  model: PropTypes.shape().isRequired,
  onHide: PropTypes.func.isRequired,
  onMount: PropTypes.func.isRequired,
  onShow: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};

export default Dashboard;
