/**
 * Array.from polyfil
 */
const arrayFrom = Array.from || (arr => [].slice.call(arr));

export default arrayFrom;
