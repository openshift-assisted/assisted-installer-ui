module.exports = {
  contextSeparator: '_',
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en', 'ja'],
  defaultNS: process.env.TRANSLATION_NAMESPACE, // the default file for strings when using useTranslation, etc
  namespaceSeparator: '~',
  reactNamespace: false,
  useKeysAsDefaultValue: true,
  output: './locales/$LOCALE/translation.json',
  sort: true,
};
