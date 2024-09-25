import { createId } from '@paralleldrive/cuid2';
import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { FieldErrors } from 'react-hook-form';
import { promiseHash } from 'remix-utils/promise';
import { z } from 'zod';

import { i18next } from '~/features/localization/i18next.server';
import { saveInviteLinkUseToDatabase } from '~/features/organizations/invite-link-uses-model.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { getInviteLinkToken } from '~/features/organizations/organizations-helpers.server';
import {
  addMembersToOrganizationInDatabaseById,
  retrieveActiveInviteLinkFromDatabaseByToken,
} from '~/features/organizations/organizations-model.server';
import {
  getDoesUserProfileExistByEmail,
  getIsEmailAvailableForRegistration,
} from '~/features/user-profile/user-profile-helpers.server';
import {
  retrieveUserProfileWithMembershipsFromDatabaseByClerkId,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { getErrorMessage } from '~/utils/get-error-message';
import { badRequest, conflict } from '~/utils/http-responses.server';
import { parseFormData } from '~/utils/parse-form-data.server';
import { createToastHeaders } from '~/utils/toast.server';

import {
  getUserFromClerkById,
  getUserFromClerkBySessionId,
} from '../clerk-sdk.server';
import {
  loginFormSchema,
  registrationFormSchema,
} from '../user-authentication-client-schemas';
import {
  getLoginRedirectUrl,
  login,
  requireAnonymous,
} from '../user-authentication-helpers.server';

const loginSchema = z.discriminatedUnion('intent', [
  loginFormSchema,
  z.object({
    intent: z.literal('clerkEmailLogin'),
    sessionId: z.string({
      invalid_type_error: 'login:session-id-malformed-error',
      required_error: 'login:session-id-missing',
    }),
  }),
]);

export type LoginActionData = {
  email?: string;
  errors?: FieldErrors<z.infer<typeof loginFormSchema>>;
};

export const loginAction = async ({
  request,
}: Pick<ActionFunctionArgs, 'request'>) => {
  await requireAnonymous(request);

  const { data, t } = await promiseHash({
    data: parseFormData(loginSchema, request),
    t: i18next.getFixedT(request),
  });

  switch (data.intent) {
    case 'emailLogin': {
      const { email } = data;

      const emailAvailable = await getIsEmailAvailableForRegistration(email);

      if (emailAvailable) {
        return badRequest<LoginActionData>({
          errors: {
            email: { message: 'login:user-doesnt-exist', type: 'manual' },
          },
        });
      }

      return json({ email });
    }
    case 'clerkEmailLogin': {
      const { sessionId } = data;

      const { id: clerkUserId } = await getUserFromClerkBySessionId(sessionId);

      if (typeof clerkUserId !== 'string') {
        console.error(
          new Error(
            `unable to fetch clerkUserId for client login. sessionId: ${sessionId}. recieved ${clerkUserId}`,
          ),
        );

        return badRequest<LoginActionData>({
          errors: {
            email: {
              message: 'register:missing-issuer-metadata',
              type: 'manual',
            },
          },
        });
      }

      const userProfile =
        await retrieveUserProfileWithMembershipsFromDatabaseByClerkId(
          clerkUserId,
        );

      if (!userProfile) {
        return badRequest<LoginActionData>({
          errors: {
            email: { message: 'login:user-doesnt-exist', type: 'manual' },
          },
        });
      }

      const token = getInviteLinkToken(request) || '';

      if (token) {
        const link = await retrieveActiveInviteLinkFromDatabaseByToken(token);

        if (link) {
          try {
            await addMembersToOrganizationInDatabaseById({
              id: link.organization.id,
              members: [userProfile.id],
              role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
            });
            await saveInviteLinkUseToDatabase({
              id: createId(),
              inviteLinkId: link.id,
              userId: userProfile.id,
            });
            const headers = await createToastHeaders({
              title: t('accept-membership-invite:join-success-toast-title'),
              description: t(
                'accept-membership-invite:join-success-toast-description',
                { organizationName: link.organization.name },
              ),
              type: 'success',
            });
            return login({
              init: { headers },
              redirectTo: `/organizations/${link.organization.slug}/home`,
              request,
              userId: userProfile.id,
            });
          } catch (error) {
            const message = getErrorMessage(error);

            if (
              message.includes(
                'Unique constraint failed on the fields: (`memberId`,`organizationId`)',
              )
            ) {
              const headers = await createToastHeaders({
                title: t('accept-membership-invite:already-member-toast-title'),
                description: t(
                  'accept-membership-invite:already-member-toast-description',
                  { organizationName: link.organization.name },
                ),
                type: 'info',
              });
              return await login({
                init: { headers },
                redirectTo: `/organizations/${link.organization.slug}/home`,
                request,
                userId: userProfile.id,
              });
            }

            throw error;
          }
        }

        const headers = await createToastHeaders({
          title: t('accept-membership-invite:invite-link-invalid-toast-title'),
          description: t(
            'accept-membership-invite:invite-link-invalid-toast-description',
          ),
          type: 'error',
        });
        return await login({
          init: { headers },
          redirectTo: getLoginRedirectUrl(userProfile),
          request,
          userId: userProfile.id,
        });
      }

      return await login({
        redirectTo: getLoginRedirectUrl(userProfile),
        request,
        userId: userProfile.id,
      });
    }
  }
};

const registerSchema = z.discriminatedUnion('intent', [
  registrationFormSchema,
  z.object({
    intent: z.literal('clerkEmailRegistration'),
    createdUserId: z.string({
      invalid_type_error: 'register:clerk-id-malformed-error',
      required_error: 'register:clerk-id-missing',
    }),
  }),
]);

export type RegisterActionData = {
  email?: string;
  errors?: FieldErrors<z.infer<typeof registrationFormSchema>>;
};

export const registerAction = async ({
  request,
}: Pick<ActionFunctionArgs, 'request'>) => {
  await requireAnonymous(request);

  const { data, t } = await promiseHash({
    data: parseFormData(registerSchema, request),
    t: i18next.getFixedT(request),
  });

  switch (data.intent) {
    case 'emailRegistration': {
      const userProfileExists = await getDoesUserProfileExistByEmail(
        data.email,
      );

      if (userProfileExists) {
        return conflict<RegisterActionData>({
          errors: {
            email: { message: 'register:user-already-exists', type: 'manual' },
          },
        });
      }

      return json({ email: data.email });
    }
    case 'clerkEmailRegistration': {
      const { createdUserId } = data;

      const { primaryEmailAddress, id: clerkUserId } =
        await getUserFromClerkById(createdUserId);

      const email = primaryEmailAddress?.emailAddress;

      if (typeof clerkUserId !== 'string') {
        console.log(
          new Error(
            `unable to fetch clerkUserId for client registration. createdUserId: ${createdUserId}. recieved ${clerkUserId}`,
          ),
        );
        return badRequest<RegisterActionData>({
          errors: {
            email: {
              message: 'register:missing-issuer-metadata',
              type: 'manual',
            },
          },
        });
      }

      if (typeof email !== 'string') {
        return badRequest<RegisterActionData>({
          errors: {
            email: {
              message: 'register:missing-email-metadata',
              type: 'manual',
            },
          },
        });
      }

      try {
        const userProfile = await saveUserProfileToDatabase({
          id: createId(),
          clerkId: clerkUserId,
          email,
          acceptedTermsAndConditions: true,
        });

        const token = getInviteLinkToken(request) || '';

        if (token) {
          const link = await retrieveActiveInviteLinkFromDatabaseByToken(token);

          if (link) {
            const headers = await createToastHeaders({
              title: t('accept-membership-invite:join-success-toast-title'),
              description: t(
                'accept-membership-invite:join-success-toast-description',
                { organizationName: link.organization.name },
              ),
              type: 'success',
            });
            await addMembersToOrganizationInDatabaseById({
              id: link.organization.id,
              members: [userProfile.id],
              role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
            });
            await saveInviteLinkUseToDatabase({
              id: createId(),
              inviteLinkId: link.id,
              userId: userProfile.id,
            });

            return login({
              request,
              userId: userProfile.id,
              redirectTo: '/onboarding/user-profile',
              init: { headers },
            });
          }
        }

        return login({
          request,
          userId: userProfile.id,
          redirectTo: '/onboarding',
          init: token
            ? {
                headers: await createToastHeaders({
                  title: t(
                    'accept-membership-invite:invite-link-invalid-toast-title',
                  ),
                  description: t(
                    'accept-membership-invite:invite-link-invalid-toast-description',
                  ),
                  type: 'error',
                }),
              }
            : undefined,
        });
      } catch {
        return badRequest<RegisterActionData>({
          errors: {
            email: { message: 'register:registration-failed', type: 'manual' },
          },
        });
      }
    }
  }
};
