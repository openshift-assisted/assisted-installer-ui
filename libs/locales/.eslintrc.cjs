/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  overrides: [
    {
      files: ['./@types/**/*.d.ts'],
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
