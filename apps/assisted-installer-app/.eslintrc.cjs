/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  ignorePatterns: ['src/entry.ts'],
  overrides: [
    {
      files: ['./src/**/*.{ts,tsx}'],
      extends: ['@openshift-assisted/eslint-config', 'plugin:react/jsx-runtime'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
      },
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react-i18next',
                importNames: ['useTranslation'],
                message: 'Import `useTranslation` from `@openshift-assisted/ui-lib/common` instead',
              },
              {
                name: '@openshift-assisted/ui-lib',
                message: 'Import from `@openshift-assisted/ui-lib/ocm` instead',
              },
            ],
          },
        ],
      },
    },
  ],
};
