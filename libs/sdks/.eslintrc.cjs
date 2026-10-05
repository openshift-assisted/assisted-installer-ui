/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  overrides: [
    {
      files: ['./lib/**/*.ts'],
      extends: ['@openshift-assisted/eslint-config'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
  ],
};
