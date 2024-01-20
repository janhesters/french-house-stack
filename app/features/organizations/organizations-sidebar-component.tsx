import type { UIMatch } from '@remix-run/react';
import { useMatches } from '@remix-run/react';
import { HomeIcon, SettingsIcon } from 'lucide-react';
import { findLast, has, pipe, prop } from 'ramda';
import { useTranslation } from 'react-i18next';

import type { HeaderUserProfileDropDownProps } from '~/components/header';
import { Sidebar } from '~/components/sidebar';

import type { OrganizationsSwitcherComponentProps } from './organizations-switcher-component';
import { OrganizationsSwitcherComponent } from './organizations-switcher-component';

type AppData = {
  headerTitle?: string;
  renderSearchBar?: boolean;
  renderBackButton?: boolean;
  renderStaticSidebar?: boolean;
};
type RouteMatch = UIMatch<AppData>;

export const findHeaderTitle = (matches: RouteMatch[]) =>
  findLast(pipe(prop('data'), has('headerTitle')), matches)?.data?.headerTitle;

export const findRenderSearchBar = (matches: RouteMatch[]) =>
  findLast(pipe(prop('data'), has('renderSearchBar')), matches)?.data
    ?.renderSearchBar;

export const findRenderBackButton = (matches: RouteMatch[]) =>
  findLast(pipe(prop('data'), has('renderBackButton')), matches)?.data
    ?.renderBackButton;

export const findRenderStaticSidebar = (matches: RouteMatch[]) =>
  findLast(pipe(prop('data'), has('renderStaticSidebar')), matches)?.data
    ?.renderStaticSidebar;

export type OrganizationsSideBarComponentProps = {
  organizationSlug: string;
  userNavigation: HeaderUserProfileDropDownProps;
} & Pick<OrganizationsSwitcherComponentProps, 'organizations'>;

export function OrganizationsSidebarComponent({
  organizations,
  organizationSlug,
  userNavigation,
}: OrganizationsSideBarComponentProps) {
  const { t } = useTranslation('organizations');
  const matches = useMatches() as RouteMatch[];

  // All of the settings below can be set using the `loader` function.
  const headerTitle = findHeaderTitle(matches);
  const renderSearchBar = findRenderSearchBar(matches);
  const renderBackButton = findRenderBackButton(matches);
  const renderStaticSidebar = findRenderStaticSidebar(matches);

  return (
    <Sidebar
      sidebarTitle={
        <div className="flex h-13 items-center border-b pl-2 pr-12 lg:pr-2">
          <OrganizationsSwitcherComponent organizations={organizations} />
        </div>
      }
      headerTitle={headerTitle}
      navigation={[
        {
          id: 'app',
          items: [
            {
              name: t('home'),
              href: `/organizations/${organizationSlug}/home`,
              icon: HomeIcon,
            },
            {
              name: t('settings'),
              href: `/organizations/${organizationSlug}/settings`,
              icon: SettingsIcon,
            },
          ],
        },
      ]}
      renderBackButton={renderBackButton}
      renderSearchBar={renderSearchBar}
      renderStaticSidebar={renderStaticSidebar}
      userNavigation={userNavigation}
    />
  );
}
