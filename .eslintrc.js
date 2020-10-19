module.exports = {
  extends: ['airbnb'],
  rules: {
    'comma-dangle': 0,
    'consistent-return': 0,
    'func-names': 0,
    'max-len': [2, 120, 4],
    'no-continue': 0,
    'no-func-assign': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'no-redeclare': 0,
    'no-restricted-syntax': 0,
    'no-underscore-dangle': 0,
    'no-unused-expressions': 0,
    'no-use-before-define': 0,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'react/no-find-dom-node': 0,
    'react/prop-types': 0
  },
  env: {
    browser: true,
    es6: true,
    jasmine: true,
    jest: true,
    node: true
  },
  plugins: ['import', 'react', 'react-hooks'],
  parser: 'babel-eslint'
};
