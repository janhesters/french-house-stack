import { faker } from '@faker-js/faker';
import type { UserProfile } from '@prisma/client';

import { generateRandomDid } from '~/test/generate-random-did.server';
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
  email = '',
  name = '',
  avatar = '',
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) => ({ id, email, name, avatar, createdAt, updatedAt });

/**
 * Creates a user profile with populated values.
 *
 * @param userProfileParams - User profile params to create user profile with.
 * @returns A populated user profile with given params.
 */
export const createPopulatedUserProfile: Factory<UserProfile> = ({
  id = generateRandomDid(),
  email = faker.internet.email(),
  name = faker.name.fullName(),
  avatar = faker.image.avatar(),
  updatedAt = faker.date.recent(10),
  createdAt = faker.date.past(3, updatedAt),
} = {}) => createUserProfile({ id, email, name, avatar, createdAt, updatedAt });
