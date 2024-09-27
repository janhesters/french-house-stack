import type { LoaderFunctionArgs } from '@remix-run/node';
import type { ShouldRevalidateFunctionArgs } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';

import { organizationSlugLoader } from '~/features/organizations/organizations-loaders.server';
import { OrganizationsSidebarComponent } from '~/features/organizations/organizations-sidebar-component';

export const handle = { i18n: ['organizations', 'sidebar', 'header'] };

/* 
  With single fetch enabled, the layout route loader will always be called for every subroute change.
  we can skip re-running this loader if the organization slug remains unchanged by opting into Remix's granular single fetch.
  If you want to opt out of granular single fetch and always re-run this loader, you can remove this function
  To learn more about granular single fetch, see the Remix documentation on revalidations: 
  https://remix.run/docs/en/main/guides/single-fetch#revalidations
 **/
export const shouldRevalidate = ({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) => {
  if (currentParams.organizationSlug !== nextParams.organizationSlug) {
    return true;
  }
  return defaultShouldRevalidate;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await organizationSlugLoader({ request, params });
}

export default function Organization() {
  const data = useLoaderData<typeof loader>();

  return <OrganizationsSidebarComponent {...data} />;
}
