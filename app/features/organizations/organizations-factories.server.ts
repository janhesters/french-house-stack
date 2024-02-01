import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type {
  InviteLinkUse,
  Organization,
  OrganizationInviteLink,
} from '@prisma/client';
import { addDays } from 'date-fns';

import type { Factory } from '~/utils/types';

/**
 * Creates an organization _**without**_ any values. If you want to create a
 * organization with values, use `createPopulatedOrganization` instead.
 *
 * @param organizationParams - Organization params to create organization with.
 * @returns Organization with given params.
 */
export const createOrganization: Factory<Organization> = ({
  createdAt = new Date(),
  id = '',
  name = '',
  slug = faker.helpers.slugify(name).toLowerCase(),
  updatedAt = new Date(),
} = {}) => ({ id, createdAt, updatedAt, name, slug });

/**
 * Creates a organization with populated values.
 *
 * @param organizationParams - Organization params to create organization with.
 * @returns A populated organization with given params.
 */
export const createPopulatedOrganization: Factory<Organization> = ({
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ years: 3, refDate: updatedAt }),
  id = createId(),
  name = `${faker.word.sample().replaceAll(/['/]/g, '')} ${faker.company
    .name()
    // Regex to remove single quotes and '/' from the company name because they
    // become HTML entities and then mess up our tests.
    .replaceAll(/['/]/g, '')} ${faker.word
    .sample()
    .replaceAll(/['/]/g, '')}`.trim(),
  slug = faker.helpers.slugify(name).toLowerCase(),
} = {}) => ({ id, createdAt, updatedAt, name, slug });

/**
 * Creates an organization invite link _**without**_ any values. If you want to create a
 * organization invite link with values, use `createPopulatedOrganizationInviteLink` instead.
 *
 * @param linkParams - OrganizationInviteLink params to create organization invite link with.
 * @returns OrganizationInviteLink with given params.
 */
export const createOrganizationInviteLink: Factory<OrganizationInviteLink> = ({
  createdAt = new Date(),
  id = '',
  organizationId = '',
  creatorId = '',
  expiresAt = new Date(),
  token = '',
  updatedAt = new Date(),
  deactivatedAt = new Date(),
} = {}) => ({
  id,
  createdAt,
  updatedAt,
  organizationId,
  creatorId,
  expiresAt,
  token,
  deactivatedAt,
});

/**
 * Creates an organization invite link with populated values.
 *
 * @param linkParams - OrganizationInviteLink params to create organization invite link with.
 * @returns A populated organization invite link with given params.
 */
export const createPopulatedOrganizationInviteLink: Factory<
  Omit<OrganizationInviteLink, 'creatorId'> & { creatorId: string }
> = ({
  updatedAt = faker.date.recent({ days: 1 }),
  createdAt = faker.date.recent({ days: 1, refDate: updatedAt }),
  id = createId(),
  organizationId = createId(),
  creatorId = createId(),
  expiresAt = faker.date.soon({ days: 3, refDate: addDays(updatedAt, 2) }),
  token = createId(),
  // eslint-disable-next-line unicorn/no-null
  deactivatedAt = null,
} = {}) => ({
  id,
  createdAt,
  updatedAt,
  organizationId,
  creatorId,
  expiresAt,
  token,
  deactivatedAt,
});

/**
 * Creates an invite link usage _**without**_ any values. If you want to create an
 * invite link usage with values, use `createPopulatedinviteLinkUse` instead.
 *
 * @param usageParams - inviteLinkUse params to create invite link usage with.
 * @returns inviteLinkUse with given params.
 */
export const createinviteLinkUse: Factory<InviteLinkUse> = ({
  createdAt = new Date(),
  id = '',
  inviteLinkId = '',
  userId = '',
  updatedAt = new Date(),
} = {}) => ({ id, createdAt, updatedAt, inviteLinkId, userId });

/**
 * Creates an invite link usage with populated values.
 *
 * @param usageParams - inviteLinkUse params to create invite link usage with.
 * @returns A populated invite link usage with given params.
 */
export const createPopulatedinviteLinkUse: Factory<InviteLinkUse> = ({
  updatedAt = faker.date.recent({ days: 1 }),
  createdAt = faker.date.recent({ days: 1, refDate: updatedAt }),
  id = createId(),
  inviteLinkId = createId(),
  userId = createId(),
} = {}) => ({ id, createdAt, updatedAt, inviteLinkId, userId });
