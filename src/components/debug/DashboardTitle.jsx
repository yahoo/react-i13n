/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';

const DashboardTitle = (props) => {
  const { title } = props;
  const style = {
    background: '#673ab7',
    color: 'rgba(255,255,255,.87)',
    padding: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  return <li style={style}>{title}</li>;
};

DashboardTitle.propTypes = {
  title: PropTypes.string.isRequired
};

export default DashboardTitle;
