/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  overrides: [
    {
      files: ['./vite.config.ts'],
      extends: ['@openshift-assisted/eslint-config'],
      env: {
        browser: false,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
      rules: {
        'no-console': 'off',
      },
    },
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
                message:
                  'Import `useTranslation` from `lib/common/hooks/use-translation-wrapper.ts` instead',
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
