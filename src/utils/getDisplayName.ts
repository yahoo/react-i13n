/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';

const getDisplayName = (Component: React.ComponentType<any> | null | undefined, fallback?: string) => {
  if (!Component) {
    return fallback;
  }
  const { displayName, name } = Component;
  return displayName ?? name ?? fallback ?? Component;
};

export default getDisplayName;
