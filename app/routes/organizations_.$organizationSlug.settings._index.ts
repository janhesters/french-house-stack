import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url).pathname;
  return redirect(url + '/profile');
};
