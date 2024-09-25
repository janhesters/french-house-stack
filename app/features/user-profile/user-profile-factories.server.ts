import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { UserProfile } from '@prisma/client';

import { generateRandomClerkId } from '~/test/generate-random-did.server';
import type { Factory } from '~/utils/types';

/**
 * Creates a user profile _**without**_ any values. If you want to create a
 * user profile with values, use `createPopulatedUserProfile` instead.
 *
 * @param userProfileParams - User profile params to create user profile with.
 * @returns User profile with given params.
 */
export const createUserProfile: Factory<UserProfile> = ({
  id = '',
  createdAt = new Date(),
  updatedAt = new Date(),
  clerkId = '',
  email = '',
  name = '',
  acceptedTermsAndConditions = false,
} = {}) => ({
  id,
  clerkId,
  email,
  name,
  createdAt,
  updatedAt,
  acceptedTermsAndConditions,
});

/**
 * Creates a user profile with populated values.
 *
 * @param userProfileParams - User profile params to create user profile with.
 * @returns A populated user profile with given params.
 */
export const createPopulatedUserProfile: Factory<UserProfile> = ({
  id = createId(),
  clerkId = generateRandomClerkId(),
  email = faker.internet.email(),
  name = faker.person.fullName(),
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ years: 3, refDate: updatedAt }),
  acceptedTermsAndConditions = true,
} = {}) => ({
  id,
  clerkId,
  email,
  name,
  createdAt,
  updatedAt,
  acceptedTermsAndConditions,
});
