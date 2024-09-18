import Stripe from 'stripe';

export const stripeAdmin =
  typeof process.env.STRIPE_SECRET_KEY === 'string' &&
  new Stripe(process.env.STRIPE_SECRET_KEY);
