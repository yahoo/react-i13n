import React from 'react';

const DashboardTitle = (props) => {
  const { title } = props;
  const style = {
    background: '#673ab7',
    color: 'rgba(255,255,255,.87)',
    padding: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hiiden',
    textOverflow: 'ellipsis'
  };

  return <li style={style}>{title}</li>;
};

export default DashboardTitle;
