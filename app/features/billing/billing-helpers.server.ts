import { pipe } from 'ramda';
import type { Stripe } from 'stripe';

import { getSearchParameterFromRequest } from '~/utils/get-search-parameter-from-request.server';

import { stripeAdmin } from './stripe-admin.server';

function stripeIsConfigured(stripe: Stripe | false): stripe is Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return true;
}

export async function createStripeCheckoutSession({
  baseUrl,
  organizationId,
  organizationSlug,
  priceId,
  stripeCustomerId,
  userEmail,
  userId,
}: {
  baseUrl: string;
  organizationId: string;
  organizationSlug: string;
  priceId: string;
  stripeCustomerId: string;
  userEmail: string;
  userId: string;
}) {
  if (stripeIsConfigured(stripeAdmin)) {
    const hasCustomerId = stripeCustomerId && stripeCustomerId !== '';
    const session = await stripeAdmin.checkout.sessions.create({
      automatic_tax: { enabled: true },
      cancel_url: `${baseUrl}/organization/${organizationSlug}/billing/pricing`,
      customer_email: hasCustomerId ? undefined : userEmail,
      customer: hasCustomerId ? stripeCustomerId : undefined,
      customer_update: hasCustomerId
        ? { address: 'auto', name: 'auto', shipping: 'auto' }
        : undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { organizationId, organizationSlug, userEmail, userId },
      subscription_data: {
        metadata: { organizationId, organizationSlug, userEmail, userId },
      },
      mode: 'subscription',
      success_url: `${baseUrl}/organization/${organizationSlug}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.url!;
  }
}

export function stringToBillingPeriod(
  billingPeriod: string | null,
): 'monthly' | 'annually' {
  return billingPeriod === 'monthly' ? 'monthly' : 'annually';
}

export const getBillingPeriodFromRequest = pipe(
  getSearchParameterFromRequest('billingPeriod'),
  stringToBillingPeriod,
);
