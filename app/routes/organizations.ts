import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { requireOnboardedUserProfileExists } from '~/features/onboarding/onboarding-helpers.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireOnboardedUserProfileExists(request);
  return redirect(
    `/organizations/${user.memberships[0].organization.slug}/home`,
  );
}
