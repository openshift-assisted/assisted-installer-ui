/**@type {import('eslint').ESLint.ConfigData} */
module.exports = {
  overrides: [
    {
      files: ['./lib/**/*.ts'],
      extends: ['@openshift-assisted/eslint-config'],
      env: {
        browser: false,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
