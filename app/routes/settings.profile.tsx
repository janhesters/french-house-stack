import type { ActionFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { makeDomainFunction } from 'remix-domains';
import { formAction } from 'remix-forms';
import { z } from 'zod';

import { requireUserIsAuthenticated } from '~/features/user-authentication/user-authentication-session.server';
import UserProfileComponent, {
  schema,
} from '~/features/user-profile/user-profile-component';
import { requireUserProfileExists } from '~/features/user-profile/user-profile-helpers.server';
import { updateUserProfileInDatabaseById } from '~/features/user-profile/user-profile-model.server';
import getPageTitle from '~/utils/get-page-title.server';

export const handle = { i18n: 'user-profile' };

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserIsAuthenticated(request);
  const user = await requireUserProfileExists(userId);

  const url = new URL(request.url);
  const success = url.searchParams.get('success') === 'true';

  return json({
    title: await getPageTitle(request, 'user-profile:profile'),
    email: user.email,
    name: user.name,
    success,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: data?.title,
});

const environmentSchema = z.object({ userId: z.string().length(51) });

const mutation = makeDomainFunction(
  schema,
  environmentSchema,
)(
  async (values, { userId }) =>
    await updateUserProfileInDatabaseById({ id: userId, userProfile: values }),
);

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/settings/profile?success=true',
    environment: { userId: await requireUserIsAuthenticated(request) },
  });

export default function ProfilePage() {
  const data = useLoaderData<typeof loader>();

  return <UserProfileComponent {...data} />;
}
