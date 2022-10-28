import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useSubmit, useTransition } from '@remix-run/react';
import { Magic } from 'magic-sdk';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import i18next from '~/features/localization/i18next.server';
import magicAdmin from '~/features/user-authentication/magic-admin.server';
import UserAuthenticationComponent, {
  actionName,
  loginAction,
} from '~/features/user-authentication/user-authentication-component';
import {
  createUserSession,
  getUserId,
} from '~/features/user-authentication/user-authentication-session.server';
import useEffectOnce from '~/hooks/use-effect-once';
import usePromise from '~/hooks/use-promise';
import getSafeRedirectDestination from '~/utils/get-safe-redirect-destination.server';

export const handle = { i18n: 'user-authentication' };

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);

  if (userId) {
    const redirectTo = getSafeRedirectDestination(request, '/home');
    return redirect(redirectTo);
  }

  const t = await i18next.getFixedT(request);

  return json({
    title: `${t('user-authentication:sign-in-sign-up')} | ${t('app-name')}`,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data: { title } }) => ({
  title,
});

type ActionData = {
  email?: string;
  emailError?: string;
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

const magicAction = 'magic';
const magicErrorAction = 'magicError';

export const action = async ({ request }: ActionArgs) => {
  const t = await i18next.getFixedT(request);
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === loginAction) {
    const { email } = values;
    const emailSchema = z
      .string({
        required_error: t('user-authentication:email-required'),
        invalid_type_error: t('user-authentication:email-must-be-string'),
      })
      .email({ message: t('user-authentication:email-invalid') });

    const result = emailSchema.safeParse(email);

    if (!result.success) {
      return badRequest({ emailError: result.error.issues[0].message });
    }

    return json<ActionData>({ email: result.data });
  }

  if (_action === magicAction) {
    const { didToken } = values;

    if (typeof didToken !== 'string') {
      // TODO: report error.
      return badRequest({
        formError: t('user-authentication:did-token-malformed-error'),
      });
    }

    const { issuer } = await magicAdmin.users.getMetadataByToken(didToken);

    if (typeof issuer !== 'string') {
      // TODO: report error.
      return badRequest({
        formError: t('user-authentication:missing-issuer-metadata'),
      });
    }

    const redirectTo = getSafeRedirectDestination(request, '/home');

    return createUserSession({
      request,
      userId: issuer,
      remember: true,
      redirectTo,
    });
  }

  if (_action === magicErrorAction) {
    const { formError } = values;
    // TODO: report errors here

    if (typeof formError !== 'string') {
      return badRequest({ formError: 'Invalid Magic error.' });
    }

    return badRequest({ formError });
  }

  return badRequest({
    formError: t('user-authentication:invalid-action', { action: _action }),
  });
};

export default function LoginPage() {
  const { t } = useTranslation();
  const data = useActionData<ActionData>();
  const transition = useTransition();
  const state: 'idle' | 'error' | 'submitting' =
    transition.submission || data?.email
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
      // TODO: report error
      // TODO: force user to reload page
      submit(
        {
          [actionName]: magicErrorAction,
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

          if (!didToken) {
            // TODO: report error
            submit(
              {
                [actionName]: magicErrorAction,
                formError: t('user-authentication:did-token-missing'),
              },
              { method: 'post', replace: true },
            );
          } else {
            submit(
              { didToken, [actionName]: magicAction },
              { method: 'post', replace: true },
            );
          }
        } catch {
          // TODO: reportError
          submit(
            {
              [actionName]: magicErrorAction,
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
