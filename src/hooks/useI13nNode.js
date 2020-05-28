/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { useEffect, useRef, useState } from 'react';

import I13nNode from '../libs/I13nNode';

const useI13nNode = ({
  parentI13nNode,
  i13nInstance: reactI13n,
  isLeafNode,
  i13nModel
}) => {
  const i13nNodeRef = useRef();
  const [i13nNode, setI13nNode] = useState();

  useEffect(() => {
    if (reactI13n && !i13nNode) {
      // check if reactI13n is initialized successfully, otherwise return
      const I13nNodeClass = (reactI13n?.getI13nNodeClass()) ?? I13nNode;

      i13nNodeRef.current = new I13nNodeClass(
        parentI13nNode,
        i13nModel,
        isLeafNode,
        reactI13n.isViewportEnabled()
      );
      setI13nNode(i13nNodeRef.current);
    }
  }, [parentI13nNode, reactI13n, isLeafNode]);

  return {
    i13nNode
  };
};

export default useI13nNode;
