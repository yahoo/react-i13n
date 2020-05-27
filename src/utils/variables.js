/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const { NODE_ENV } = process.env;

export const IS_PROD = NODE_ENV === 'production';
export const IS_TEST = NODE_ENV === 'test';
export const IS_CLIENT = typeof window !== 'undefined';
export const ENVIRONMENT = IS_CLIENT ? 'client' : 'server';
