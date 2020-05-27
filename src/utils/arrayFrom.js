/**
 * Copyright 2015 - Present, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/**
 * Array.from polyfil
 */
const arrayFrom = Array.from || (arr => [].slice.call(arr));

export default arrayFrom;
