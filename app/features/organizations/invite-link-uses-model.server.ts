import type {
  InviteLinkUse,
  OrganizationInviteLink,
  UserProfile,
} from '@prisma/client';

import { prisma } from '~/database.server';

export type PartialinviteLinkUseParameters = Pick<
  Parameters<typeof prisma.inviteLinkUse.create>[0]['data'],
  'id'
>;

// CREATE

/**
 * Saves a new Invite Link Uses to the database.
 *
 * @param Invite Link Uses - Parameters of the Invite Link Uses that should be created.
 * @returns The newly created Invite Link Uses.
 */
export async function saveInviteLinkUseToDatabase(
  inviteLinkUse: PartialinviteLinkUseParameters & {
    inviteLinkId: OrganizationInviteLink['id'];
    userId: UserProfile['id'];
  },
) {
  return prisma.inviteLinkUse.create({ data: inviteLinkUse });
}

// READ

/**
 * Retrieves a Invite Link Uses record from the database based on its id.
 *
 * @param id - The id of the Invite Link Uses to get.
 * @returns The Invite Link Uses with a given id or null if it wasn't found.
 */
export async function retrieveInviteLinkUseFromDatabaseById(
  id: InviteLinkUse['id'],
) {
  return prisma.inviteLinkUse.findUnique({ where: { id } });
}

export async function retrieveinviteLinkUseFromDatabaseByUserIdAndLinkId({
  inviteLinkId,
  userId,
}: {
  inviteLinkId: OrganizationInviteLink['id'];
  userId: UserProfile['id'];
}) {
  return prisma.inviteLinkUse.findUnique({
    where: { inviteLinkId_userId: { inviteLinkId, userId } },
  });
}

// UPDATE

type inviteLinkUseUpdateParameters = Parameters<
  typeof prisma.inviteLinkUse.update
>[0]['data'] & {
  inviteLinkId: OrganizationInviteLink['id'];
  userId: UserProfile['id'];
};

/**
 *  Updates a Invite Link Uses in the database.
 *
 * @param options - A an object with the Invite Link Uses's id and the new values.
 * @returns The updated Invite Link Uses.
 */
export async function updateInviteLinkUseInDatabaseById({
  id,
  inviteLinkUse,
}: {
  /**
   * The id of the Invite Link Uses you want to update.
   */
  id: InviteLinkUse['id'];
  /**
   * The values of the Invite Link Uses you want to change.
   */
  inviteLinkUse: Partial<Omit<inviteLinkUseUpdateParameters, 'id'>>;
}) {
  return prisma.inviteLinkUse.update({ where: { id }, data: inviteLinkUse });
}

// DELETE

/**
 * Removes a Invite Link Uses from the database.
 *
 * @param id - The id of the Invite Link Uses you want to delete.
 * @returns The Invite Link Uses that was deleted.
 */
export async function deleteInviteLinkUseFromDatabaseById(
  id: InviteLinkUse['id'],
) {
  return prisma.inviteLinkUse.delete({ where: { id } });
}
