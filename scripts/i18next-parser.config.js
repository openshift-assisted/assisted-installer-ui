module.exports = {
  contextSeparator: '_',
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  // the default file for strings when using useTranslation, etc
  defaultNS: process.env.TRANSLATION_NAMESPACE,
  namespaceSeparator: '~',
  reactNamespace: false,
  useKeysAsDefaultValue: true,
  output: `./locales/$LOCALE/translation.json`,
  sort: true,
};
