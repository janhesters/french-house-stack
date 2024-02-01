import { resolve } from 'node:path';

import Backend from 'i18next-fs-backend';
import { RemixI18Next } from 'remix-i18next';

import { i18n } from './i18n';

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
  },
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
    },
    ns: [
      'common',
      'accept-membership-invite',
      'drag-and-drop',
      'header',
      'login',
      'onboarding-organization',
      'onboarding-user-profile',
      'organization-profile',
      'organization-team-members',
      'organization-settings',
      'organizations-new',
      'organizations',
      'pagination',
      'register',
      'settings',
      'settings-account',
      'settings-user-profile',
      'sidebar',
      'user-profile',
    ],
  },
  plugins: [Backend],
});
