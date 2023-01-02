import { randomBytes } from 'crypto';

/**
 * Generates a random decentralized identity token (DID). This function is to
 * _**generate fake test data only**_. We use DIDs for user ids.
 *
 * @see https://magic.link/docs/introduction/decentralized-id
 *
 * @returns did - Decentralized identity token.
 */
export function generateRandomDid() {
  return 'did:ethr:0x' + randomBytes(32).toString('hex').slice(0, 40);
}
