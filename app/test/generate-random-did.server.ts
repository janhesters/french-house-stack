import { randomBytes } from 'node:crypto';

/**
 * Generates a random Clerk id. This function is to
 * _**generate fake test data only**_. We use clerk ids for user ids.
 *
 * @see https://clerk.com/docs/references/javascript/user/user
 *
 * @returns clerkId
 */
export function generateRandomClerkId() {
  return 'user_' + randomBytes(32).toString('hex').slice(0, 40);
}
