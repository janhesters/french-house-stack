import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '../../public/locales/en/common.json';
import home from '../../public/locales/en/home.json';
import userAuthentication from '../../public/locales/en/user-authentication.json';
import userProfile from '../../public/locales/en/user-profile.json';

i18next.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  ns: ['common', 'home', 'user-authentication'],
  resources: {
    en: {
      common,
      home,
      'user-authentication': userAuthentication,
      'user-profile': userProfile,
    },
  },
});

export { default } from 'i18next';
