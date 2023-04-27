/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    comment: true,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    project: true,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Turned off in order to improve performance
    '@typescript-eslint/indent': 'off',
    indent: 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',

    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'function',
        format: ['PascalCase', 'camelCase'],
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': {
            message: 'Use Record<string, unknown> instead',
            fixWith: 'Record<string, unknown>',
          },
        },
      },
    ],
    '@typescript-eslint/no-explicit-any': [
      'warn',
      {
        fixToUnknown: true,
      },
    ],
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lodash',
            message: 'Import from "lodash-es/<module>.js" instead.',
          },
        ],
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react/self-closing-comp': 'error',
    'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    'react-hooks/exhaustive-deps': 'error',
    'react/prop-types': 'off',
  },
};
