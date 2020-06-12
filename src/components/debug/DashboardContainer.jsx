/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';

import DashboardTitle from './DashboardTitle';
import DashboardItem from './DashboardItem';

const DashboardContainer = (props) => {
  const { title, model, DOMNode } = props;
  const style = {
    margin: '0px',
    paddingLeft: '0px',
    boxShadow: '0 1px 4px 0 rgba(0,0,0,.28)',
    listStyle: 'none'
  };

  return (
    <ul style={style}>
      <DashboardTitle title={title} />
      {Object.keys(model).map((key) => {
        const modelItem = model[key];
        const text = `${key} : ${modelItem.value}${modelItem.DOMNode !== DOMNode ? ' (inherited)' : ''}`;
        return (
          <DashboardItem
            key={text}
            text={text}
          />
        );
      })}
    </ul>
  );
};

DashboardContainer.propTypes = {
  title: PropTypes.string.isRequired,
  model: PropTypes.shape().isRequired
};

export default DashboardContainer;
