import type {
  Membership,
  Organization,
  OrganizationInviteLink,
  UserProfile,
} from '@prisma/client';

import { prisma } from '~/database.server';

import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';

export type PartialOrganizationParameters = Pick<
  Parameters<typeof prisma.organization.create>[0]['data'],
  'id' | 'name' | 'slug' | 'memberships'
>;

// CREATE

/**
 * Saves a new organization to the database.
 *
 * @param organization - Parameters of the organization that should be created.
 * @returns The newly created organization.
 */
export async function saveOrganizationToDatabase(
  organization: PartialOrganizationParameters,
) {
  return prisma.organization.create({ data: organization });
}

// READ

/**
 * Retrieves a organization record from the database based on its id.
 *
 * @param id - The id of the organization to get.
 * @returns The organization with a given id or null if it wasn't found.
 */
export async function retrieveOrganizationFromDatabaseById(
  id: Organization['id'],
) {
  return prisma.organization.findUnique({ where: { id } });
}

/**
 * Retrieves a organization record from the database based on its slug.
 *
 * @param slug - The slug of the organization to get.
 * @returns The organization with a given slug or null if it wasn't found.
 */
export async function retrieveOrganizationFromDatabaseBySlug(
  slug: Organization['slug'],
) {
  return prisma.organization.findUnique({ where: { slug } });
}

/**
 * Retrieves a organization record with its logo and members from the database
 * based on its slug.
 *
 * @param slug - The slug of the organization with members to get.
 * @returns The organization with its members with a given slug or null if it
 * wasn't found.
 */
export async function retrieveOrganizationWithMembersFromDatabaseBySlug(
  slug: Organization['slug'],
) {
  return prisma.organization.findUnique({
    where: { slug },
    include: { memberships: { include: { member: true } } },
  });
}

/**
 * Retrieves the number of members of an organization from the database based on
 * its id.
 *
 * @param organizationId - The ID of the organization.
 * @returns The number of members of the organization.
 */
export function retrieveTotalOrganizationMembersCountFromDatabaseByOrganizationId(
  organizationId: Organization['id'],
) {
  return prisma.membership.count({ where: { organizationId } });
}

/**
 * Retrieves organization members from the database by organization ID and
 * paginates the results. The members are sorted aplhabetically by name.
 *
 * @param organizationId - The ID of the organization.
 * @param page - The current page number.
 * @param perPage - The number of items to be displayed per page (default: 10).
 * @returns A promise that resolves to an array of members for the given
 * organization sorted alphabetically by name.
 */
export async function retrieveOrganizationMembersFromDatabaseByOrganizationIdForPage({
  organizationId,
  page,
  perPage = 10,
}: {
  organizationId: Organization['id'];
  page: number;
  perPage?: number;
}) {
  return prisma.membership.findMany({
    where: { organizationId },
    select: {
      deactivatedAt: true,
      member: { select: { id: true, name: true, email: true } },
      role: true,
    },
    orderBy: { member: { name: 'asc' } },
    skip: (page - 1) * perPage,
    take: perPage,
  });
}

/**
 * Retrieves the organizations of a user based on their userId.
 *
 * @param userId - The userId of the user whose organizations you want to get.
 * @returns An array of organizations the user is a member of.
 */
export async function retrieveOrganizationsByUserIdFromDatabase(
  userId: UserProfile['id'],
) {
  const userProfile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: {
      memberships: {
        select: {
          organization: true,
          role: true,
          member: { select: { id: true } },
        },
      },
    },
  });

  if (!userProfile) {
    throw new Error(`User with id ${userId} not found.`);
  }

  return userProfile.memberships;
}

/**
 * Retrieves a membership record from the database based on a user's id and an
 * organization's id.
 *
 * @param userId - The id of the user.
 * @param organizationId - The id of the organization.
 * @returns The membership record.
 */
export async function retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId({
  userId,
  organizationId,
}: {
  userId: UserProfile['id'];
  organizationId: Organization['id'];
}) {
  return prisma.membership.findUnique({
    where: { memberId_organizationId: { memberId: userId, organizationId } },
    select: { deactivatedAt: true, role: true },
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

/**
 * Retrieves an active OrganizationInviteLink record from the database based on
 * its token.
 *
 * @param token - The token of the OrganizationInviteLink to get.
 * @returns The OrganizationInviteLink with a given token or null if it wasn't
 * found or its deactivated or expired.
 */
export async function retrieveActiveInviteLinkFromDatabaseByToken(
  token: OrganizationInviteLink['token'],
) {
  const now = new Date();
  return prisma.organizationInviteLink.findFirst({
    where: {
      token,
      // eslint-disable-next-line unicorn/no-null
      deactivatedAt: null,
      expiresAt: { gt: now },
    },
    select: {
      creatorId: true,
      deactivatedAt: true,
      expiresAt: true,
      id: true,
      organization: { select: { id: true, name: true, slug: true } },
      token: true,
    },
  });
}

// UPDATE

type OrganizationUpdateParameters = Parameters<
  typeof prisma.organization.update
>[0]['data'] & { logoId: string };

/**
 *  Updates a organization in the database.
 *
 * @param options - A an object with the organization's id and the new values.
 * @returns The updated organization.
 */
export async function updateOrganizationInDatabaseById({
  id,
  organization,
}: {
  /**
   * The id of the organization you want to update.
   */
  id: Organization['id'];
  /**
   * The values of the organization you want to change.
   */
  organization: Partial<
    Omit<OrganizationUpdateParameters, 'id' | 'logoId'> & {
      logoId: OrganizationUpdateParameters['logoId'];
    }
  >;
}) {
  return prisma.organization.update({ where: { id }, data: organization });
}

/**
 * Adds members to an organization.
 *
 * @param options - An object with the organization's id, the id of the user who
 * assigned the members and the ids of the members.
 * @returns The updated organization.
 */
export async function addMembersToOrganizationInDatabaseById({
  id,
  members,
  role = ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
}: {
  id: Organization['id'];
  members: UserProfile['id'][];
  role?: Membership['role'];
}) {
  return prisma.organization.update({
    where: { id },
    data: {
      memberships: {
        create: members.map(memberId => ({
          member: { connect: { id: memberId } },
          role,
        })),
      },
    },
  });
}

/**
 * Updates a membership record in the database based on a user's id and an
 * organization's id.
 *
 * @param userId - The id of the user.
 * @param organizationId - The id of the organization.
 * @returns The updated membership record.
 */
export async function updatedMembershipInDatabaseByUserIdAndOrganizationId({
  userId,
  organizationId,
  membership,
}: {
  userId: UserProfile['id'];
  organizationId: Organization['id'];
  membership: Pick<Membership, 'deactivatedAt'>;
}) {
  return prisma.membership.update({
    where: { memberId_organizationId: { memberId: userId, organizationId } },
    data: membership,
  });
}

// DELETE

/**
 * Removes a organization from the database.
 *
 * @param id - The id of the organization you want to delete.
 * @returns The organization that was deleted.
 */
export async function deleteOrganizationFromDatabaseById(
  id: Organization['id'],
) {
  return prisma.organization.delete({ where: { id } });
}
