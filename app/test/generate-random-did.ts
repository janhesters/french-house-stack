import { faker } from '@faker-js/faker';

/**
 * Generates a random decentralized identity token (DID). This function is to
 * _**generate fake test data only**_. We use DIDs for user ids.
 *
 * @see https://magic.link/docs/introduction/decentralized-id
 *
 * @returns did - Decentralized identity token.
 */
export default function generateRandomDid() {
  return 'did:ethr:' + faker.finance.ethereumAddress();
}
