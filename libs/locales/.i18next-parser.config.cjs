const defaultNS = process.env.TRANSLATION_NAMESPACE || 'translation';

module.exports = {
  input: [
    '../ui-lib/lib/**/*.{js,jsx,ts,tsx}',
    '../../apps/assisted-disconnected-ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  contextSeparator: '_',
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  defaultNS,
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultValue: (_locale, _namespace, key, value) => value || key,
  output: `./lib/$LOCALE/${defaultNS}.json`,
  sort: true,
};
