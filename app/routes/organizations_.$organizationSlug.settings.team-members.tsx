import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { useTranslation } from '~/features/localization/use-translation';
import { organizationTeamMembersAction } from '~/features/organizations/organizations-actions.server';
import { organizationSettingsTeamMembersLoader } from '~/features/organizations/organizations-loaders.server';
import { TeamMembersInviteLinkCardComponent } from '~/features/organizations/team-members-invite-link-card-component';
import { TeamMembersListCardComponent } from '~/features/organizations/team-members-list-card-component';
import { cn } from '~/utils/shadcn-ui';

export const handle = { i18n: ['pagination', 'organization-team-members'] };

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await organizationSettingsTeamMembersLoader({ request, params });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Organization Profile' },
];

export async function action({ request, params }: ActionFunctionArgs) {
  return await organizationTeamMembersAction({ request, params });
}

export default function OrganizationSettingsTeamMembers() {
  const { t } = useTranslation('organization-team-members');
  const loaderData = useLoaderData<typeof loader>();

  return (
    <>
      <main className="mx-auto flex max-w-5xl flex-col gap-2 p-2 md:flex-row lg:gap-4 lg:p-4">
        <h2 className="sr-only">{t('team-members')}</h2>

        {loaderData.currentUserIsOwner && (
          <div className="max-h-min md:w-1/2">
            <TeamMembersInviteLinkCardComponent
              inviteLink={loaderData.inviteLink}
            />
          </div>
        )}

        <div
          className={cn(
            loaderData.currentUserIsOwner
              ? 'md:w-1/2'
              : 'mx-auto w-full max-w-2xl',
          )}
        >
          <TeamMembersListCardComponent
            currentPage={loaderData.currentPage}
            currentUsersId={loaderData.currentUsersId}
            currentUserIsOwner={loaderData.currentUserIsOwner}
            totalItemCount={loaderData.totalItemCount}
            teamMembers={loaderData.teamMembers.map(member => ({
              ...member,
              deactivatedAt:
                member.deactivatedAt === null
                  ? // eslint-disable-next-line unicorn/no-null
                    null
                  : new Date(member.deactivatedAt),
            }))}
          />
        </div>
      </main>
    </>
  );
}
