const { NODE_ENV } = process.env;
const IS_PROD = NODE_ENV === 'production';
const IS_TEST = NODE_ENV === 'test';

const warnAndPrintTrace = (errorMessage) => {
  if (!IS_PROD) {
    console && console.warn && console.warn(errorMessage);
    !IS_TEST && console && console.trace && console.trace();
  }
};

export default warnAndPrintTrace;
