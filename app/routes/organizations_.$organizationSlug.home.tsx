import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';

export function loader({ request }: LoaderFunctionArgs) {
  return json({ headerTitle: 'Home' });
}

export default function OrganizationsHome() {
  return <main>Organizations Home</main>;
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
