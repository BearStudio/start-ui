import dayjs from 'dayjs';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE } from '@/constants/i18n';
import * as locales from '@/locales';

i18n.use(initReactI18next).init({
  defaultNS: 'common',
  ns: Object.keys(locales[DEFAULT_LANGUAGE]),
  resources: locales,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,

  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

i18n.on('languageChanged', (langKey) => {
  dayjs.locale(langKey);
});

export default i18n;
