const defaultNS = process.env.TRANSLATION_NAMESPACE || 'translation';

module.exports = {
  input: [
    '../common/src/**/*.{js,jsx,ts,tsx}',
    '../ocm/src/**/*.{js,jsx,ts,tsx}',
    '../cim/src/**/*.{js,jsx,ts,tsx}',
    '../chatbot/lib/**/*.{js,jsx,ts,tsx}',
    '../../apps/assisted-disconnected-ui/src/**/*.{js,jsx,ts,tsx}',
  ],
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
