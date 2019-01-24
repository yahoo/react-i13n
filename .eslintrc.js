module.exports = {
  extends: [
    "eslint-config-airbnb-base",
    "eslint-config-airbnb-base/rules/strict"
  ].map(require.resolve),
  rules: {
    "comma-dangle": 0,
    "no-underscore-dangle": 0,
    "no-param-reassign": 0,
    "no-plusplus": 0,
    "no-func-assign": 0,
    "no-use-before-define": 0,
    "func-names": 0
  }
};
