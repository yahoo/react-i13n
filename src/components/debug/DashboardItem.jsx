/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';

const DashboardItem = (props) => {
  const { text } = props;
  const style = {
    background: '#d1c4e9',
    color: 'rgba(0,0,0,.87)',
    padding: '8px',
    borderTop: 'rgba(0,0,0,.12) 1px solid',
    whiteSpace: 'nowrap',
    overflow: 'hiiden',
    textOverflow: 'ellipsis'
  };

  return (
    <li
      style={style}
    >
      {text}
    </li>
  );
};

DashboardItem.propTypes = {
  text: PropTypes.string.isRequired
};

export default DashboardItem;
