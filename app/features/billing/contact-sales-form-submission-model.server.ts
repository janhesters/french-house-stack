import type { ContactSalesFormSubmission } from '@prisma/client';

import { prisma } from '~/database.server';

export type PartialContactSalesFormSubmissionParameters = Pick<
  Parameters<typeof prisma.contactSalesFormSubmission.create>[0]['data'],
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'workEmail'
  | 'phoneNumber'
  | 'companyName'
  | 'message'
>;

// CREATE

/**
 * Saves a new contact sales form submission to the database.
 *
 * @param contact sales form submission - Parameters of the contact sales form
 * submission that should be created.
 * @returns The newly created contact sales form submission.
 */
export async function saveContactSalesFormSubmissionToDatabase(
  contactSalesFormSubmission: PartialContactSalesFormSubmissionParameters,
) {
  return await prisma.contactSalesFormSubmission.create({
    data: contactSalesFormSubmission,
  });
}

// READ

/**
 * Retrieves a contact sales form submission record from the database based on
 * its id.
 *
 * @param id - The id of the contact sales form submission to get.
 * @returns The contact sales form submission with a given id or null if it
 * wasn't found.
 */
export async function retrieveContactSalesFormSubmissionFromDatabaseById(
  id: ContactSalesFormSubmission['id'],
) {
  return await prisma.contactSalesFormSubmission.findUnique({ where: { id } });
}

// UPDATE

/**
 *  Updates a contact sales form submission in the database.
 *
 * @param options - A an object with the contact sales form submission's id and
 * the new values.
 * @returns The updated contact sales form submission.
 */
export async function updateContactSalesFormSubmissionInDatabaseById({
  id,
  contactSalesFormSubmission,
}: {
  /**
   * The id of the contact sales form submission you want to update.
   */
  id: ContactSalesFormSubmission['id'];
  /**
   * The values of the contact sales form submission you want to change.
   */
  contactSalesFormSubmission: Partial<
    Omit<
      Parameters<typeof prisma.contactSalesFormSubmission.update>[0]['data'],
      'id'
    >
  >;
}) {
  return await prisma.contactSalesFormSubmission.update({
    where: { id },
    data: contactSalesFormSubmission,
  });
}

// DELETE

/**
 * Removes a contact sales form submission from the database.
 *
 * @param id - The id of the contact sales form submission you want to delete.
 * @returns The contact sales form submission that was deleted.
 */
export async function deleteContactSalesFormSubmissionFromDatabaseById(
  id: ContactSalesFormSubmission['id'],
) {
  return await prisma.contactSalesFormSubmission.delete({ where: { id } });
}
