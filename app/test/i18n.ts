import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import acceptMembershipInvite from '../../public/locales/en/accept-membership-invite.json';
import common from '../../public/locales/en/common.json';
import dragAndDrop from '../../public/locales/en/drag-and-drop.json';
import header from '../../public/locales/en/header.json';
import login from '../../public/locales/en/login.json';
import onboardingOrganization from '../../public/locales/en/onboarding-organization.json';
import onboardingUserProfile from '../../public/locales/en/onboarding-user-profile.json';
import organizationProfile from '../../public/locales/en/organization-profile.json';
import organizationSettings from '../../public/locales/en/organization-settings.json';
import organizationTeamMembers from '../../public/locales/en/organization-team-members.json';
import organizations from '../../public/locales/en/organizations.json';
import organizationsNew from '../../public/locales/en/organizations-new.json';
import pagination from '../../public/locales/en/pagination.json';
import register from '../../public/locales/en/register.json';
import settings from '../../public/locales/en/settings.json';
import settingsAccount from '../../public/locales/en/settings-account.json';
import settingsUserProfile from '../../public/locales/en/settings-user-profile.json';
import sidebar from '../../public/locales/en/sidebar.json';
import userProfile from '../../public/locales/en/user-profile.json';

i18next.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  ns: [
    'common',
    'accept-membership-invite',
    'drag-and-drop',
    'header',
    'landing',
    'login',
    'onboarding-organization',
    'onboarding-user-profile',
    'organization-profile',
    'organization-settings',
    'organization-team-members',
    'organizations',
    'organizations-new',
    'pagination',
    'register',
    'settings',
    'settings-account',
    'settings-user-profile',
    'sidebar',
    'user-profile',
  ],
  resources: {
    en: {
      common,
      'accept-membership-invite': acceptMembershipInvite,
      'drag-and-drop': dragAndDrop,
      header,
      login,
      'onboarding-organization': onboardingOrganization,
      'onboarding-user-profile': onboardingUserProfile,
      'organization-profile': organizationProfile,
      'organization-settings': organizationSettings,
      'organization-team-members': organizationTeamMembers,
      organizations,
      'organizations-new': organizationsNew,
      pagination,
      register,
      settings,
      'settings-account': settingsAccount,
      'settings-user-profile': settingsUserProfile,
      sidebar,
      'user-profile': userProfile,
    },
  },
});

export { default } from 'i18next';
