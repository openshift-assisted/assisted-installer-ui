import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en as enTranslation } from '@openshift-assisted/locales/en';

const dateTimeFormatter = new Intl.DateTimeFormat({
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
      translation: enTranslation,
    },
  },
  supportedLngs: ['en'],
  fallbackLng: 'en',
  load: 'languageOnly',
  detection: { caches: [] },
  defaultNS: 'translation',
  nsSeparator: '~',
  keySeparator: false,
  debug: false,
  interpolation: {
    format(value, format, lng) {
      if (format === 'number') {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#Browser_compatibility
        return new Intl.NumberFormat(lng).format(value);
      }
      if (value instanceof Date) {
        return dateTimeFormatter.format(value);
      }
      return value;
    },
    escapeValue: false, // not needed for react as it escapes by default
  },
  react: {
    useSuspense: true,
    transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
  },
  missingKeyHandler(lng, ns, key) {
    // eslint-disable-next-line no-console
    console.error(`Missing i18n key '${key}' in namespace '${ns}' and language '${lng}.'`);
  },
});

export default i18n;
