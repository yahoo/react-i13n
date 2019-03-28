import React from 'react';

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
      {Object.keys(model).map((key, index) => {
        const text = `${key} : ${model[key].value}${model[key].DOMNode !== DOMNode ? ' (inherited)' : ''}`;
        return <DashboardItem key={index} text={text} />;
      })}
    </ul>
  );
};

export default DashboardContainer;
