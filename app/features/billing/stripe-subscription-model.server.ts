import type {
  Organization,
  StripeSubscription,
  UserProfile,
} from '@prisma/client';

import { prisma } from '~/database.server';

export type PartialStripeSubscriptionParameters = Pick<
  Parameters<typeof prisma.stripeSubscription.create>[0]['data'],
  | 'id'
  | 'created'
  | 'cancelAtPeriodEnd'
  | 'currentPeriodEnd'
  | 'items'
  | 'currentPeriodStart'
  | 'status'
>;

// CREATE

/**
 * Saves a new stripe subscription to the database.
 *
 * @param stripe subscription - Parameters of the stripe subscription that should be created.
 * @returns The newly created stripe subscription.
 */
export async function saveStripeSubscriptionToDatabase(
  stripeSubscription: PartialStripeSubscriptionParameters & {
    organizationId: Organization['id'];
    buyerId: UserProfile['id'];
  },
) {
  return prisma.stripeSubscription.create({ data: stripeSubscription });
}

// READ

/**
 * Retrieves a stripe subscription record from the database based on its id.
 *
 * @param id - The id of the stripe subscription to get.
 * @returns The stripe subscription with a given id or null if it wasn't found.
 */
export async function retrieveStripeSubscriptionFromDatabaseById(
  id: StripeSubscription['id'],
) {
  return prisma.stripeSubscription.findUnique({ where: { id } });
}

/**
 * Retrieves the latest active stripe subscription for a given organization.
 *
 * @param id - The id of the organization.
 * @returns The latest active stripe subscription for the organization or null
 * if not found.
 */
export async function retrieveLatestStripeSubscriptionFromDatabaseByOrganizationId(
  organizationId: Organization['id'],
) {
  const now = new Date();

  return prisma.stripeSubscription.findFirst({
    where: {
      organizationId,
      currentPeriodStart: { lte: now },
      currentPeriodEnd: { gte: now },
      status: 'active',
    },
    orderBy: { currentPeriodStart: 'desc' },
  });
}

// UPDATE

type StripeSubscriptionUpdateParameters = Parameters<
  typeof prisma.stripeSubscription.update
>[0]['data'] & {
  organizationId: Organization['id'];
  buyerId: UserProfile['id'];
};

/**
 *  Updates a stripe subscription in the database.
 *
 * @param options - A an object with the stripe subscription's id and the new values.
 * @returns The updated stripe subscription.
 */
export async function updateStripeSubscriptionInDatabaseById({
  id,
  stripeSubscription,
}: {
  /**
   * The id of the stripe subscription you want to update.
   */
  id: StripeSubscription['id'];
  /**
   * The values of the stripe subscription you want to change.
   */
  stripeSubscription: Partial<Omit<StripeSubscriptionUpdateParameters, 'id'>>;
}) {
  return prisma.stripeSubscription.update({
    where: { id },
    data: stripeSubscription,
  });
}

// DELETE

/**
 * Removes a stripe subscription from the database.
 *
 * @param id - The id of the stripe subscription you want to delete.
 * @returns The stripe subscription that was deleted.
 */
export async function deleteStripeSubscriptionFromDatabaseById(
  id: StripeSubscription['id'],
) {
  return prisma.stripeSubscription.delete({ where: { id } });
}
