import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { UserAuthSession } from '@prisma/client';

import { generateRandomDid } from '~/test/generate-random-did.server';
import type { Factory } from '~/utils/types';

/**
 * Creates a user auth session _**without**_ any values. If you want to create a
 * user auth session with values, use `createPopulatedUserAuthSession` instead.
 *
 * @param sessionParams - User auth session params to create session with.
 * @returns User auth session with given params.
 */
export const createUserAuthSession: Factory<UserAuthSession> = ({
  id = '',
  createdAt = new Date(),
  updatedAt = new Date(),
  userId = '',
  expirationDate = new Date(),
} = {}) => ({ id, userId, createdAt, updatedAt, expirationDate });

/**
 * Creates a user auth session with populated values.
 *
 * @param sessionParams - User auth session params to create session with.
 * @returns A populated user auth session with given params.
 */
export const createPopulatedUserAuthSession: Factory<UserAuthSession> = ({
  id = createId(),
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ years: 3, refDate: updatedAt }),
  userId = generateRandomDid(),
  expirationDate = faker.date.future({ years: 1, refDate: updatedAt }),
} = {}) => ({ id, userId, createdAt, updatedAt, expirationDate });
