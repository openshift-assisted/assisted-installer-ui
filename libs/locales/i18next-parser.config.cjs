const defaultNS = process.env.TRANSLATION_NAMESPACE || 'translation';

module.exports = {
  input: '../ui-lib/lib/**/*.{js,jsx,ts,tsx}',
  contextSeparator: '_',
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  defaultNS,
  namespaceSeparator: '~',
  reactNamespace: false,
  useKeysAsDefaultValue: true,
  output: `./lib/$LOCALE/${defaultNS}.json`,
  sort: true,
};
