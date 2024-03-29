/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';

const TriggerNode = (props) => {
  const { onClick } = props;
  const style = {
    background: '#673ab7',
    color: 'rgba(255,255,255,.87)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '0 4px'
  };

  return (
    <span
      style={style}
      onClick={onClick}
    >
      &#8964;
    </span>
  );
};

TriggerNode.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default TriggerNode;
