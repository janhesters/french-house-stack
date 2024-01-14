import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '../../public/locales/en/common.json';
import dragAndDrop from '../../public/locales/en/drag-and-drop.json';
import header from '../../public/locales/en/header.json';
import login from '../../public/locales/en/login.json';
import onboardingOrganization from '../../public/locales/en/onboarding-organization.json';
import onboardingUserProfile from '../../public/locales/en/onboarding-user-profile.json';
import organizations from '../../public/locales/en/organizations.json';
import organizationsNew from '../../public/locales/en/organizations-new.json';
import register from '../../public/locales/en/register.json';
import sidebar from '../../public/locales/en/sidebar.json';
import userProfile from '../../public/locales/en/user-profile.json';

i18next.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  ns: [
    'common',
    'drag-and-drop',
    'header',
    'landing',
    'login',
    'onboarding-organization',
    'onboarding-user-profile',
    'organizations',
    'organizations-new',
    'register',
    'sidebar',
    'user-profile',
  ],
  resources: {
    en: {
      common,
      'drag-and-drop': dragAndDrop,
      header,
      login,
      'onboarding-organization': onboardingOrganization,
      'onboarding-user-profile': onboardingUserProfile,
      organizations,
      'organizations-new': organizationsNew,
      register,
      sidebar,
      'user-profile': userProfile,
    },
  },
});

export { default } from 'i18next';
