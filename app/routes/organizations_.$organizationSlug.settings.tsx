import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';
import { buttonVariants } from '~/components/ui/button';
import { useTranslation } from '~/features/localization/use-translation';
import { organizationSettingsLoader } from '~/features/organizations/organizations-loaders.server';
import { cn } from '~/utils/shadcn-ui';

export const handle = { i18n: ['organizations', 'organization-settings'] };

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await organizationSettingsLoader({ request, params });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Settings' },
];

export default function OrganizationsSettings() {
  const { t } = useTranslation('organization-settings');
  const { organizationSlug } = useLoaderData<typeof loader>();

  const settingsNavItems = [
    {
      name: t('general'),
      href: `/organizations/${organizationSlug}/settings/profile`,
    },
    {
      name: t('team-members'),
      href: `/organizations/${organizationSlug}/settings/team-members`,
    },
  ];

  return (
    <>
      <nav
        aria-label={t('settings-navigation')}
        className="h-13 w-full border-b p-2"
      >
        <ul className="mx-auto flex max-w-xl space-x-2 lg:max-w-none">
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
    </>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
