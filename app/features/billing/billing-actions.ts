import { json } from '@remix-run/node';
import type { z } from 'zod';

import { asyncPipe } from '~/utils/async-pipe';
import { checkHoneypot } from '~/utils/honeypot.server';
import { withValidatedFormData } from '~/utils/parse-form-data.server';

import { withOrganizationMembership } from '../organizations/organizations-middleware.server';
import { contactSalesFormSchema } from './billing-client-schemas';
import { saveContactSalesFormSubmissionToDatabase } from './contact-sales-form-submission-model.server';
import { stripeAdmin } from './stripe-admin.server';

/**
 * Billing
 */

async function billingHandler() {
  if (!stripeAdmin) {
    throw new Error('Stripe is not configured');
  }
}

export const billingAction = asyncPipe(
  withOrganizationMembership,
  billingHandler,
);

/**
 * Contact Sales
 */

async function contactSalesHandler({
  data,
}: {
  data: z.infer<typeof contactSalesFormSchema>;
}) {
  checkHoneypot(data);
  await saveContactSalesFormSubmissionToDatabase(data);
  return json({ success: true });
}

export const contactSalesAction = asyncPipe(
  withValidatedFormData(contactSalesFormSchema),
  contactSalesHandler,
);

/**
 * Pricing
 */
