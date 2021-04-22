/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';

const DashboardTitle = (props) => {
  const { title } = props;
  const style = {
    background: '#6001d2',
    color: 'rgba(255,255,255,.87)',
    fontFamily: 'inherit',
    overflow: 'hidden',
    padding: '8px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  return <li style={style}>{title}</li>;
};

DashboardTitle.propTypes = {
  title: PropTypes.string.isRequired
};

export default DashboardTitle;
