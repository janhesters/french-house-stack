import { createId } from '@paralleldrive/cuid2';
import { json } from '@remix-run/node';
import type { TFunction } from 'i18next';
import type { FieldErrors } from 'react-hook-form';
import { z } from 'zod';

import { magicAdmin } from '~/features/user-authentication/magic-admin.server';
import {
  getDoesUserProfileExistByEmail,
  getIsEmailAvailableForRegistration,
} from '~/features/user-profile/user-profile-helpers.server';
import {
  retrieveUserProfileWithMembershipsFromDatabaseByDid,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { asyncPipe } from '~/utils/async-pipe';
import { getErrorMessage } from '~/utils/get-error-message';
import { badRequest, conflict } from '~/utils/http-responses.server';
import { withValidatedFormData } from '~/utils/parse-form-data.server';
import { createToastHeaders } from '~/utils/toast.server';

import { withTFunction } from '../localization/localization-middleware.server';
import { saveInviteLinkUseToDatabase } from '../organizations/invite-link-uses-model.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '../organizations/organizations-constants';
import { getInviteLinkToken } from '../organizations/organizations-helpers.server';
import {
  addMembersToOrganizationInDatabaseById,
  retrieveActiveInviteLinkFromDatabaseByToken,
} from '../organizations/organizations-model.server';
import {
  loginFormSchema,
  registrationFormSchema,
} from './user-authentication-client-schemas';
import {
  getLoginRedirectUrl,
  login,
} from './user-authentication-helpers.server';
import { withAnonymousUser } from './user-authentication-middleware.server';

const loginSchema = z.discriminatedUnion('intent', [
  loginFormSchema,
  z.object({
    intent: z.literal('magicEmailLogin'),
    didToken: z.string({
      invalid_type_error: 'login:did-token-malformed-error',
      required_error: 'login:did-token-missing',
    }),
  }),
]);

export type LoginActionData = {
  email?: string;
  errors?: FieldErrors<z.infer<typeof loginFormSchema>>;
};

async function loginHandler({
  data,
  request,
  t,
}: {
  data: z.infer<typeof loginSchema>;
  request: Request;
  t: TFunction;
}) {
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
    case 'magicEmailLogin': {
      const { didToken } = data;

      const { issuer: did } =
        await magicAdmin.users.getMetadataByToken(didToken);

      if (typeof did !== 'string') {
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
        await retrieveUserProfileWithMembershipsFromDatabaseByDid(did);

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
}

export const loginAction = asyncPipe(
  withAnonymousUser,
  withValidatedFormData(loginSchema),
  withTFunction,
  loginHandler,
);

const registerSchema = z.discriminatedUnion('intent', [
  registrationFormSchema,
  z.object({
    intent: z.literal('magicEmailRegistration'),
    didToken: z.string({
      invalid_type_error: 'register:did-token-malformed-error',
      required_error: 'register:did-token-missing',
    }),
  }),
]);

export type RegisterActionData = {
  email?: string;
  errors?: FieldErrors<z.infer<typeof registrationFormSchema>>;
};

async function registerHandler({
  data,
  request,
  t,
}: {
  data: z.infer<typeof registerSchema>;
  request: Request;
  t: TFunction;
}) {
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
    case 'magicEmailRegistration': {
      const { didToken } = data;

      const { email, issuer: did } =
        await magicAdmin.users.getMetadataByToken(didToken);

      if (typeof did !== 'string') {
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
          did,
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
}

export const registerAction = asyncPipe(
  withAnonymousUser,
  withValidatedFormData(registerSchema),
  withTFunction,
  registerHandler,
);
