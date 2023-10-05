/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  overrides: [
    {
      files: ['scripts/*.js'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    {
      files: ['*.d.ts'],
      extends: ['@openshift-assisted/eslint-config'],
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
