module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parserOptions: {
    // Must be aligned with our esbuild settings ('esnext')
    // Consumers of this library are in charge of transpiling it to es5
    ecmaVersion: 'latest',
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['*.js'],
      env: {
        es6: true,
        node: true,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
      extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        comment: true,
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        eqeqeq: ['error', 'always'],
        indent: 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
          // Allowing for React components definitions
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
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'lodash',
                message: 'Please use lodash/module instead.',
              },
              {
                name: 'react-i18next',
                importNames: ['useTranslation'],
                message:
                  'Please use useTranslation from src/common/hooks/use-translation-wrapper.ts instead',
              },
            ],
            patterns: ['**/ocm/**/', '**/cim/**/'],
          },
        ],
        '@typescript-eslint/no-explicit-any': [
          'warn',
          {
            fixToUnknown: true,
          },
        ],
        '@typescript-eslint/no-misused-promises': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react/self-closing-comp': 'error',
        'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
        'react-hooks/exhaustive-deps': 'warn',
        'react/prop-types': 'off',
      },
    },
  ],
  // node_modules and dot-files/folders are always ignored
  // (src: https://eslint.org/docs/user-guide/configuring/ignoring-code#the-eslintignore-file)
  ignorePatterns: ['dist/*'],
};
