const { NODE_ENV } = process.env;
const IS_PROD = 'production' === NODE_ENV;
const IS_TEST = 'test' === NODE_ENV;
export const warnAndPrintTrace = errorMessage => {
  if (!IS_PROD) {
    console && console.warn && console.warn(errorMessage);
    !IS_TEST && console && console.trace && console.trace();
  }
};
