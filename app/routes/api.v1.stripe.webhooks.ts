import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { stripeAdmin } from '~/features/billing/stripe-admin.server';
import {
  deleteStripeSubscriptionFromDatabaseById,
  saveStripeSubscriptionToDatabase,
  updateStripeSubscriptionInDatabaseById,
} from '~/features/billing/stripe-subscription-model.server';
import { updateUserProfileInDatabaseByEmail } from '~/features/user-profile/user-profile-model.server';
import { getErrorMessage } from '~/utils/get-error-message';
import {
  badRequest,
  internalServerError,
  notAllowed,
} from '~/utils/http-responses.server';

export const loader = async () => notAllowed();

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return notAllowed();
  }

  if (!stripeAdmin) {
    throw internalServerError({ message: 'Stripe is not initialized' });
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return badRequest({ message: 'Missing stripe-signature header' });
  }

  invariant(
    process.env.STRIPE_WEBHOOK_SECRET,
    'STRIPE_WEBHOOK_SECRET environment variable is not set',
  );
  const payload = await request.text();

  try {
    const event = stripeAdmin.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object;

        await saveStripeSubscriptionToDatabase({
          id: subscription.id,
          organizationId: subscription.metadata.organizationId,
          buyerId: subscription.metadata.userId,
          created: new Date(subscription.created * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          items: JSON.stringify(subscription.items),
          status: subscription.status,
        });

        return json({ message: 'Ok' });
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        await updateStripeSubscriptionInDatabaseById({
          id: subscription.id,
          stripeSubscription: {
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000,
            ),
            items: JSON.stringify(subscription.items),
            status: subscription.status,
          },
        });

        return json({ message: 'Ok' });
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await deleteStripeSubscriptionFromDatabaseById(subscription.id);

        return json({ message: 'Ok' });
      }
      case 'customer.created': {
        const customer = event.data.object;

        if (customer.email) {
          await updateUserProfileInDatabaseByEmail({
            email: customer.email,
            userProfile: { stripeCustomerId: customer.id },
          });
        }

        return json({ message: 'Ok' });
      }
      case 'customer.deleted': {
        const customer = event.data.object;

        if (customer.email) {
          await updateUserProfileInDatabaseByEmail({
            email: customer.email,
            userProfile: { stripeCustomerId: '' },
          });
        }

        return json({ message: 'Ok' });
      }
      case 'charge.succeeded':
      case 'payment_method.attached':
      case 'customer.updated':
      case 'checkout.session.completed':
      case 'invoice.created':
      case 'invoice.finalized':
      case 'invoice.updated':
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
      case 'payment_intent.succeeded':
      case 'payment_intent.created':
      case 'invoiceitem.created':
      case 'billing_portal.session.created':
      case 'invoice.voided':
      case 'payment_intent.canceled':
      case 'charge.failed':
      case 'invoice.payment_failed':
      case 'payment_intent.payment_failed': {
        return json({ message: 'Ok' });
      }
      default: {
        console.log('Stripe webhook unhandled event type:', event.type);
        console.log('Stripe webhook payload:', JSON.stringify(payload));

        return json({ message: `Unhandled event type: ${event.type}` });
      }
    }
  } catch (error) {
    return badRequest({ error: `Webhook Error: ${getErrorMessage(error)}` });
  }
}
