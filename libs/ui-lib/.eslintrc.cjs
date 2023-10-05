/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  overrides: [
    {
      files: ['./vitest.config.ts'],
      extends: ['@openshift-assisted/eslint-config'],
      env: {
        node: true,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json',
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['./lib/**/*.{ts,tsx}'],
      extends: ['@openshift-assisted/eslint-config'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json',
      },
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react-i18next',
                importNames: ['useTranslation'],
                message:
                  'Please import useTranslation from lib/common/hooks/use-translation-wrapper.ts instead',
              },
            ],
            patterns: ['**/ocm/**/', '**/cim/**/'],
          },
        ],
      },
    },
  ],
};
