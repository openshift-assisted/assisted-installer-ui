import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translation from '@openshift-assisted/locales/en/translation.json';

const dateTimeFormatter = new Intl.DateTimeFormat('default', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  year: 'numeric',
});

void i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      translation,
    },
  },
  supportedLngs: ['en'],
  fallbackLng: 'en',
  load: 'languageOnly',
  detection: { caches: [] },
  defaultNS: 'translation',
  nsSeparator: '~',
  keySeparator: false,
  debug: true,
  interpolation: {
    format(value, format, lng) {
      let output = value as unknown;
      if (
        format === 'number' &&
        (typeof value === 'number' || typeof value === 'bigint')
      ) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#Browser_compatibility
        output = new Intl.NumberFormat(lng).format(value);
      }

      if (value instanceof Date) {
        output = dateTimeFormatter.format(value);
      }

      return String(output);
    },
    escapeValue: false, // not needed for react as it escapes by default
  },
  react: {
    useSuspense: true,
    transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
  },
  missingKeyHandler(lng, ns, key) {
    if (lng instanceof Array) {
      for (const language of lng) {
        // eslint-disable-next-line no-console
        console.warn(
          `Missing i18n key '${key}' in namespace '${ns}' and language '${language}.'`,
        );
      }
    }
  },
});

export default i18n;
