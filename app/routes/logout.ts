import { type ActionFunctionArgs, redirect } from '@remix-run/node';

import { logout } from '~/features/user-authentication/user-authentication-helpers.server';

export function loader() {
  return redirect('/');
}

export async function action({ request }: ActionFunctionArgs) {
  return await logout(request);
}
