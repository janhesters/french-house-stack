import type {
  Organization,
  OrganizationInviteLink,
  UserProfile,
} from '@prisma/client';

import { prisma } from '~/database.server';

export type PartialOrganizationInviteLinkParameters = Pick<
  Parameters<typeof prisma.organizationInviteLink.create>[0]['data'],
  'id' | 'token' | 'expiresAt'
>;

// CREATE

/**
 * Saves a new OrganizationInviteLink to the database.
 *
 * @param OrganizationInviteLink - Parameters of the OrganizationInviteLink that
 * should be created.
 * @returns The newly created OrganizationInviteLink.
 */
export async function saveOrganizationInviteLinkToDatabase(
  organizationInviteLink: PartialOrganizationInviteLinkParameters & {
    creatorId: UserProfile['id'];
    organizationId: Organization['id'];
  },
) {
  return prisma.organizationInviteLink.create({ data: organizationInviteLink });
}

// READ

/**
 * Retrieves a OrganizationInviteLink record from the database based on its id.
 *
 * @param id - The id of the OrganizationInviteLink to get.
 * @returns The OrganizationInviteLink with a given id or null if it wasn't
 * found.
 */
export async function retrieveOrganizationInviteLinkFromDatabaseById(
  id: OrganizationInviteLink['id'],
) {
  return prisma.organizationInviteLink.findUnique({ where: { id } });
}

/**
 * Retrieves a creator and organization associated with a specific
 * OrganizationInviteLink record from the database based on the token.
 *
 * @param token - The token of the OrganizationInviteLink to retrieve.
 * @returns An object containing the names of the creator and the organization
 * associated with the provided token, or null if no link was found.
 */
export async function retrieveCreatorAndOrganizationFromDatabaseByToken(
  token: OrganizationInviteLink['token'],
) {
  return prisma.organizationInviteLink.findUnique({
    where: { token },
    select: {
      id: true,
      creator: { select: { name: true, id: true } },
      expiresAt: true,
      organization: { select: { name: true, id: true } },
    },
  });
}

/**
 * Retrieves the latest active OrganizationInviteLink record from the database
 * based on the organization id.
 * @param id - The id of the OrganizationInviteLink to get.
 * @returns The OrganizationInviteLink with a given id or null if it wasn't
 */
export async function retrieveLatestInviteLinkFromDatabaseByOrganizationId(
  id: Organization['id'],
) {
  const now = new Date();
  return prisma.organizationInviteLink.findFirst({
    where: {
      organizationId: id,
      // eslint-disable-next-line unicorn/no-null
      deactivatedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      creatorId: true,
      deactivatedAt: true,
      expiresAt: true,
      id: true,
      token: true,
    },
  });
}

// UPDATE

type OrganizationInviteLinkUpdateParameters = Parameters<
  typeof prisma.organizationInviteLink.update
>[0]['data'] & {
  creatorId: UserProfile['id'];
  organizationId: Organization['id'];
};

/**
 *  Updates a OrganizationInviteLink in the database.
 *
 * @param options - A an object with the OrganizationInviteLink's id and the new
 * values.
 * @returns The updated OrganizationInviteLink.
 */
export async function updateOrganizationInviteLinkInDatabaseById({
  id,
  organizationInviteLink,
}: {
  /**
   * The id of the OrganizationInviteLink you want to update.
   */
  id: OrganizationInviteLink['id'];
  /**
   * The values of the OrganizationInviteLink you want to change.
   */
  organizationInviteLink: Partial<
    Omit<OrganizationInviteLinkUpdateParameters, 'id'>
  >;
}) {
  return prisma.organizationInviteLink.update({
    where: { id },
    data: organizationInviteLink,
  });
}

// DELETE

/**
 * Removes a OrganizationInviteLink from the database.
 *
 * @param id - The id of the OrganizationInviteLink you want to delete.
 * @returns The OrganizationInviteLink that was deleted.
 */
export async function deleteOrganizationInviteLinkFromDatabaseById(
  id: OrganizationInviteLink['id'],
) {
  return prisma.organizationInviteLink.delete({ where: { id } });
}
