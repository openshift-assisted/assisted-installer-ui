module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    comment: true,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      rules: {
        eqeqeq: ['error', 'always'],
        indent: 'off',
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
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-misused-promises': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/require-await': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
        'react/prop-types': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/*'],
};
