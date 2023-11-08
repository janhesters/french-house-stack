import { createId } from '@paralleldrive/cuid2';
import { json } from '@remix-run/node';
import type { FieldErrors } from 'react-hook-form';
import { z } from 'zod';

import { magicAdmin } from '~/features/user-authentication/magic-admin.server';
import {
  getDoesUserProfileExistByEmail,
  getIsEmailAvailableForRegistration,
} from '~/features/user-profile/user-profile-helpers.server';
import {
  retrieveUserProfileFromDatabaseByDid,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { asyncPipe } from '~/utils/async-pipe';
import { badRequest, conflict } from '~/utils/http-responses.server';
import { withValidatedFormData } from '~/utils/parse-form-data.server';

import {
  loginFormSchema,
  registrationFormSchema,
} from './user-authentication-client-schemas';
import { login } from './user-authentication-helpers.server';
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
}: {
  data: z.infer<typeof loginSchema>;
  request: Request;
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

      const userProfile = await retrieveUserProfileFromDatabaseByDid(did);

      if (!userProfile) {
        return badRequest<LoginActionData>({
          errors: {
            email: { message: 'login:user-doesnt-exist', type: 'manual' },
          },
        });
      }

      return login({ request, userId: userProfile.id });
    }
  }
}

export const loginAction = asyncPipe(
  withAnonymousUser,
  withValidatedFormData(loginSchema),
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
}: {
  data: z.infer<typeof registerSchema>;
  request: Request;
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

        return login({
          request,
          userId: userProfile.id,
          redirectTo: '/onboarding',
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
  registerHandler,
);
