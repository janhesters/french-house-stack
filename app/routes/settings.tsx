import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';

import {
  Header,
  HeaderBackButton,
  HeaderSeperator,
  HeaderTitle,
  HeaderUserProfileDropdown,
} from '~/components/header';
import { buttonVariants } from '~/components/ui/button';
import { useTranslation } from '~/features/localization/use-translation';
import { settingsLoader } from '~/features/settings/settings-loaders.server';
import { cn } from '~/utils/shadcn-ui';

export const handle = { i18n: ['header', 'settings'] };

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await settingsLoader({ request, params });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'New Organization' },
];

export default function Settings() {
  const { t } = useTranslation('settings');
  const settingsNavItems = [
    { name: t('profile'), href: '/settings/profile' },
    { name: t('account'), href: '/settings/account' },
  ];
  const { userNavigation } = useLoaderData<typeof loader>();

  return (
    <div className="relative h-full">
      <Header className="absolute w-full">
        <HeaderBackButton />

        <HeaderSeperator className="lg:hidden" />

        <HeaderTitle>{t('settings')}</HeaderTitle>

        <HeaderSeperator className="hidden lg:block" />

        <HeaderUserProfileDropdown {...userNavigation} />
      </Header>

      <nav
        aria-label={t('settings-navigation')}
        className="absolute mt-13 w-full border-b p-2"
      >
        <ul className="mx-auto flex max-w-lg space-x-2">
          {settingsNavItems.map(({ name, href }) => (
            <li key={href}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    buttonVariants({ variant: 'ghost' }),
                    isActive
                      ? 'bg-muted hover:bg-muted'
                      : 'hover:bg-transparent hover:underline',
                  )
                }
                to={href}
              >
                {name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}
