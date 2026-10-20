const { FlatCompat } = require('@eslint/eslintrc');
const { fixupConfigRules } = require('@eslint/compat');
const globals = require('globals');

// eslint-config-airbnb has no flat config yet, so load it through the eslintrc compat layer
const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  ...fixupConfigRules(compat.extends('airbnb')),
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.jasmine,
        ...globals.jest,
        ...globals.node
      }
    },
    rules: {
      'comma-dangle': 0,
      'consistent-return': 0,
      'default-param-last': 0,
      'func-names': 0,
      'max-len': [2, 120, 4],
      'no-console': 0,
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
    }
  }
];
