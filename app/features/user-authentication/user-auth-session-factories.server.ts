import { faker } from '@faker-js/faker';
import type { Session } from '@prisma/client';
import cuid from 'cuid';

import { generateRandomDid } from '~/test/generate-random-did.server';
import type { Factory } from '~/utils/types';

/**
 * Creates a session _**without**_ any values. If you want to create a
 * session with values, use `createPopulatedSession` instead.
 *
 * @param sessionParams - Session params to create session with.
 * @returns session with given params.
 */
export const createSession: Factory<Session> = ({
  id = '',
  createdAt = new Date(),
  updatedAt = new Date(),
  userId = '',
  expirationDate = new Date(),
} = {}) => ({ id, userId, createdAt, updatedAt, expirationDate });

/**
 * Creates a session with populated values.
 *
 * @param sessionParams - Session params to create session with.
 * @returns A populated session with given params.
 */
export const createPopulatedSession: Factory<Session> = ({
  id = cuid(),
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ years: 3, refDate: updatedAt }),
  userId = generateRandomDid(),
  expirationDate = faker.date.future({ years: 1, refDate: updatedAt }),
} = {}) => ({ id, userId, createdAt, updatedAt, expirationDate });
