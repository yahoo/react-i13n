const { NODE_ENV } = process.env;

export const IS_PROD = NODE_ENV === 'production';
export const IS_TEST = NODE_ENV === 'test';
export const IS_CLIENT = typeof window !== 'undefined';
