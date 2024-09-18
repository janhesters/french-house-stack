import { faker } from '@faker-js/faker';
import type { ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';
import { billingAction } from '~/features/billing/billing-actions';
import type { BillingPageComponentProps } from '~/features/billing/billing-page-component';
import { BillingPageComponent } from '~/features/billing/billing-page-component';
import type { Factory } from '~/utils/types';

export async function loader() {
  const createProps: Factory<BillingPageComponentProps> = ({
    cancelAtPeriodEnd = faker.datatype.boolean(),
    currentPeriodEnd = faker.date.soon().toISOString(),
    currentSeats = faker.number.int({ min: 1, max: 10 }),
    currentTierName = faker.helpers.arrayElement(['Free', 'Pro', 'Enterprise']),
    currentUsage = faker.number.int({ min: 0, max: 500 }),
    maxSeats = currentSeats + faker.number.int({ min: 1, max: 10 }),
    maxUsage = faker.number.int({ min: currentUsage, max: 1000 }),
  } = {}) => ({
    cancelAtPeriodEnd,
    currentPeriodEnd,
    currentSeats,
    currentTierName,
    currentUsage,
    maxSeats,
    maxUsage,
  });

  return createProps();
}

export async function action({ request }: ActionFunctionArgs) {
  return billingAction({ request });
}

export default function BillingPage() {
  const props = useLoaderData<typeof loader>();

  return <BillingPageComponent {...props} />;
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
