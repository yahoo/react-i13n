/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import isUndefined from './isUndefined';

const { NODE_ENV } = process.env;

export const IS_PROD = NODE_ENV === 'production';
export const IS_TEST = NODE_ENV === 'test';
export const IS_CLIENT = typeof window !== 'undefined';
export const ENVIRONMENT = IS_CLIENT ? 'client' : 'server';

export const IS_DEBUG_MODE = (function isDebugMode() {
  if (!IS_CLIENT) {
    return false;
  }

  const { location } = window;
  if (isUndefined(location)) {
    return false;
  }
  // https://caniuse.com/#feat=url (IE needs polyfill)
  const debugParam = new URL(location.href)?.searchParams?.get('i13n_debug'); // eslint-disable-line camelcase

  return debugParam === '1';
}());
