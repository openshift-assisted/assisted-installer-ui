import * as React from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LoadingState } from '../ui';

import en from './locales/en/translation.json';
import zh from './locales/zh/translation.json';

const DEFAULT_LANG = 'en';

const i18nInstance = i18n
  .createInstance()
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next);

const resources = {
  [DEFAULT_LANG]: { translation: en },
  zh: { translation: zh },
};

console.info('Initializing i18n for assisted-ui-lib');
i18nInstance.init(
  {
    debug: true,
    fallbackLng: DEFAULT_LANG,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    // So far statically loaded since we have just a few of them
    resources,
    react: {
      useSuspense: true,
    },
    saveMissing: true,
    missingKeyHandler: (lngs: readonly string[], ns: string, key: string) => {
      console.error(`= Missing i18n key "${key}" in namespace "${ns}" and language "${lngs}."`);
    },
  },
  (err) => {
    if (err) {
      console.error('Failed to initialize i18next for the Assisted UI: ', err);
      return;
    }
    console.info("Assisted UI's i18next initialized.");
  },
);

export type I18NProps = {
  preferredLang?: string;
};

// Wrap every extension point (main component of an exposed module) inside of that component
const I18N: React.FC<I18NProps> = ({ preferredLang = DEFAULT_LANG, children }) => {
  // Something more sofisticated can come here, i.e. based on i18next.languages, so far good enough
  const supportedLang = resources[preferredLang] ? preferredLang : DEFAULT_LANG;

  React.useEffect(() => {
    if (supportedLang !== i18nInstance.language) {
      console.info(
        `assisted-ui-lib: changing language from ${i18nInstance.language} to ${supportedLang}.`,
      );
      i18nInstance.changeLanguage(supportedLang);
    }
  }, [supportedLang]);

  return (
    <React.Suspense fallback={<LoadingState />}>
      <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
    </React.Suspense>
  );
};
export default I18N;
