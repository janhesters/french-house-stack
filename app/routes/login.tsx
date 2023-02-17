import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { Magic } from 'magic-sdk';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { i18next } from '~/features/localization/i18next.server';
import { magicAdmin } from '~/features/user-authentication/magic-admin.server';
import {
  loginIntent,
  UserAuthenticationComponent,
} from '~/features/user-authentication/user-authentication-component';
import {
  createUserSession,
  getUserId,
} from '~/features/user-authentication/user-authentication-session.server';
import {
  retrieveUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { useEffectOnce } from '~/hooks/use-effect-once';
import { usePromise } from '~/hooks/use-promise';
import { getPageTitle } from '~/utils/get-page-title.server';
import { getSafeRedirectDestination } from '~/utils/get-safe-redirect-destination.server';

export const handle = { i18n: 'user-authentication' };

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);

  if (userId) {
    const redirectTo = getSafeRedirectDestination(request, '/home');
    return redirect(redirectTo);
  }

  return json({
    title: await getPageTitle(request, 'user-authentication:sign-in-sign-up'),
  });
};

export const meta: V2_MetaFunction<typeof loader> = ({ data: { title } }) => [
  { title },
];

type ActionData = {
  email?: string;
  emailError?: string;
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

const magicIntent = 'magic';
const magicErrorIntent = 'magicError';

export const action = async ({ request }: ActionArgs) => {
  const t = await i18next.getFixedT(request);
  const formData = await request.formData();
  const { _intent, ...values } = Object.fromEntries(formData);

  if (_intent === loginIntent) {
    const { email } = values;
    const emailSchema = z
      .string({
        required_error: t('user-authentication:email-required') ?? undefined,
        invalid_type_error:
          t('user-authentication:email-must-be-string') ?? undefined,
      })
      .email({ message: t('user-authentication:email-invalid') ?? undefined });

    const result = emailSchema.safeParse(email);

    if (!result.success) {
      return badRequest({ emailError: result.error.issues[0].message });
    }

    return json<ActionData>({ email: result.data });
  }

  if (_intent === magicIntent) {
    const { didToken } = values;

    if (typeof didToken !== 'string') {
      // TODO: report error.
      return badRequest({
        formError:
          t('user-authentication:did-token-malformed-error') ?? undefined,
      });
    }

    const { email, issuer: userId } = await magicAdmin.users.getMetadataByToken(
      didToken,
    );

    if (typeof userId !== 'string') {
      // TODO: report error.
      return badRequest({
        formError:
          t('user-authentication:missing-issuer-metadata') ?? undefined,
      });
    }

    const existingUser = await retrieveUserProfileFromDatabaseById(userId);

    if (!existingUser) {
      if (typeof email !== 'string') {
        // TODO: report error
        return json(
          { errorMessage: t('user-authentication:missing-email-metadata') },
          { status: 400 },
        );
      }

      await saveUserProfileToDatabase({ id: userId, email });
    }

    const redirectTo = getSafeRedirectDestination(request, '/home');

    return createUserSession({ redirectTo, remember: true, request, userId });
  }

  if (_intent === magicErrorIntent) {
    const { formError } = values;
    // TODO: report errors here

    if (typeof formError !== 'string') {
      return badRequest({ formError: 'Invalid Magic error.' });
    }

    return badRequest({ formError });
  }

  return badRequest({
    formError:
      t('user-authentication:invalid-intent', { intent: _intent }) ?? undefined,
  });
};

export default function LoginPage() {
  const { t } = useTranslation();
  const data = useActionData<ActionData>();
  const navigation = useNavigation();
  const state: 'idle' | 'error' | 'submitting' =
    navigation.state === 'submitting' || data?.email
      ? 'submitting'
      : data?.emailError || data?.formError
      ? 'error'
      : 'idle';

  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    if (state === 'error') {
      inputRef.current?.focus();
    }

    if (state === 'idle' && mounted.current) {
      inputRef.current?.select();
    }

    mounted.current = true;
  }, [state]);

  const [magicReady, setMagicReady] = usePromise<{ magic: Magic }>();
  const submit = useSubmit();

  useEffectOnce(() => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    async function downloadMagicStaticAssets() {
      const magic = new Magic(window.ENV.MAGIC_PUBLISHABLE_KEY, {
        /**
         * @see https://magic.link/docs/introduction/test-mode
         */
        testMode: window.runMagicInTestMode,
      });
      await magic.preload();
      setMagicReady({ magic });
    }

    downloadMagicStaticAssets().catch(() => {
      // TODO: force user to reload page
      // TODO: report error
      submit(
        {
          _intent: magicErrorIntent,
          formError: t('user-authentication:failed-to-load-magic'),
        },
        { method: 'post', replace: true },
      );
    });
  });

  useEffect(() => {
    if (typeof data?.email === 'string' && data?.email.length > 0) {
      async function loginWithMagic() {
        try {
          const { magic } = await magicReady;
          const didToken = await magic.auth.loginWithMagicLink({
            email: data!.email!,
          });

          if (didToken) {
            submit(
              { didToken, _intent: magicIntent },
              { method: 'post', replace: true },
            );
          } else {
            // TODO: report error
            submit(
              {
                _intent: magicErrorIntent,
                formError: t('user-authentication:did-token-missing'),
              },
              { method: 'post', replace: true },
            );
          }
        } catch {
          // TODO: reportError
          submit(
            {
              _intent: magicErrorIntent,
              formError: t('user-authentication:login-failed'),
            },
            { method: 'post', replace: true },
          );
        }
      }

      loginWithMagic();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.email]);

  return (
    <UserAuthenticationComponent
      email={data?.email}
      emailError={data?.emailError}
      formError={data?.formError}
      inputRef={inputRef}
      state={state}
    />
  );
}
