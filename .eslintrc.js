module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  ignorePatterns: ['apps/*/build', 'libs/*/build', 'libs/*/@types'],
  overrides: [
    {
      env: {
        browser: false,
      },
      extends: ['eslint:recommended', 'prettier'],
      files: ['scripts/*.cjs', 'apps/*/scripts/*.cjs', 'libs/*/scripts/*.cjs'],
    },
    {
      env: {
        browser: false,
      },
      extends: ['eslint:recommended', 'prettier'],
      files: ['scripts/*.{js,mjs}', 'apps/*/scripts/*.{js,mjs}', 'libs/*/scripts/*.{js,mjs}'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    {
      extends: ['@openshift-assisted/eslint-config-assisted-ui'],
      files: ['libs/ui-lib/lib/**/*.{ts,tsx}'],
      parserOptions: {
        tsconfigRootDir: 'libs/ui-lib',
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
    {
      extends: ['@openshift-assisted/eslint-config-assisted-ui', 'plugin:react/jsx-runtime'],
      files: ['apps/assisted-ui/src/**/*.{ts,tsx}'],
      parserOptions: {
        tsconfigRootDir: 'apps/assisted-ui',
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
                  'Import useTranslation from lib/common/hooks/use-translation-wrapper.ts instead',
              },
              {
                name: '@openshift-assisted/ui-lib',
                message: "Import from '@openshift-assisted/ui-lib/ocm' instead",
              },
            ],
          },
        ],
      },
    },
  ],
  root: true,
  rules: {
    eqeqeq: ['error', 'always'],
    indent: 'off',
  },
};
