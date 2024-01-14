import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { organizationSlugLoader } from '~/features/organizations/organizations-loaders.server';
import { OrganizationsSidebarComponent } from '~/features/organizations/organizations-sidebar-component';

export const handle = { i18n: ['organizations', 'sidebar', 'header'] };

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await organizationSlugLoader({ request, params });
}

export default function Organization() {
  const data = useLoaderData<typeof loader>();

  return <OrganizationsSidebarComponent {...data} />;
}
