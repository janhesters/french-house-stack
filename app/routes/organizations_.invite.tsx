import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { AcceptMembershipInvitePageComponent } from '~/features/organizations/accept-membership-invite-page-component';
import { organizationsAcceptInviteAction } from '~/features/organizations/organizations-actions.server';
import { acceptInviteLinkPageLoader } from '~/features/organizations/organizations-loaders.server';

export const handle = { i18n: 'accept-membership-invite' };

export async function loader(loaderArguments: LoaderFunctionArgs) {
  return await acceptInviteLinkPageLoader(loaderArguments);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Organization Invite' },
];

export async function action(actionArguments: LoaderFunctionArgs) {
  return await organizationsAcceptInviteAction(actionArguments);
}

export default function OrganizationInvite() {
  const loaderData = useLoaderData<typeof loader>();
  return <AcceptMembershipInvitePageComponent {...loaderData} />;
}
