/**@type {import('eslint').ESLint.ConfigData} */
module.exports = {
  overrides: [
    {
      files: ['tools/eslint-config/**/*.js'],
      env: {
        browser: false,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
