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
    borderTop: 'rgba(0,0,0,.12) 1px solid',
    color: 'rgba(0,0,0,.87)',
    fontFamily: 'inherit',
    overflow: 'hiiden',
    padding: '8px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
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
