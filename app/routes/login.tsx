import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useSubmit, useTransition } from '@remix-run/react';
import { useFormikContext } from 'formik';
import { Magic } from 'magic-sdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import i18next from '~/features/localization/i18next.server';
import magicAdmin from '~/features/user-authentication/magic-admin.server';
import type {
  HandleSubmit,
  UserAuthenticationInitialValues,
} from '~/features/user-authentication/user-authentication-component';
import UserAuthenticationComponent from '~/features/user-authentication/user-authentication-component';
import {
  createUserSession,
  getUserId,
} from '~/features/user-authentication/user-authentication-session.server';
import useEffectOnce from '~/hooks/use-effect-once';
import useIsOffline from '~/hooks/use-is-offline';
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

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const didToken = formData.get('didToken');

  const t = await i18next.getFixedT(request);

  if (typeof didToken !== 'string') {
    // TODO: report error.
    return json(
      { errorMessage: t('user-authentication:did-token-malformed-error') },
      { status: 400 },
    );
  }

  const { issuer } = await magicAdmin.users.getMetadataByToken(didToken);

  if (typeof issuer !== 'string') {
    // TODO: report error.
    return json(
      { errorMessage: t('user-authentication:missing-issuer-metadata') },
      { status: 400 },
    );
  }

  const redirectTo = getSafeRedirectDestination(request, '/home');

  return createUserSession({
    request,
    userId: issuer,
    remember: true,
    redirectTo,
  });
};

const SyncFormikErrorsWithRemix = () => {
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const state: 'idle' | 'error' | 'submitting' = transition.submission
    ? 'submitting'
    : actionData?.errorMessage
    ? 'error'
    : 'idle';

  const { setSubmitting, setErrors } =
    useFormikContext<UserAuthenticationInitialValues>();

  useEffect(() => {
    if (state === 'submitting') {
      return setSubmitting(true);
    }

    if (state === 'error') {
      setSubmitting(false);
      return setErrors({ email: actionData?.errorMessage });
    }

    setSubmitting(false);
    setErrors({ email: undefined });
  }, [state, setSubmitting, setErrors, actionData?.errorMessage]);

  // eslint-disable-next-line unicorn/no-null
  return null;
};

export default function LoginPage() {
  const [magicReady, setMagicReady] = usePromise<{ magic: Magic }>();
  const [failedToLoadMagic, setFailedToLoadMagic] = useState(false);

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
      // TODO: Report error
      setFailedToLoadMagic(true);
    });
  });

  const { t } = useTranslation();
  const submit = useSubmit();

  const handleSubmit: HandleSubmit = async ({ email }, { setErrors }) => {
    try {
      const { magic } = await magicReady;
      const didToken = await magic.auth.loginWithMagicLink({ email });

      if (!didToken) {
        // TODO: report error
        throw new Error(t('user-authentication:did-token-missing'));
      } else {
        submit({ didToken }, { method: 'post', replace: true });
      }
    } catch {
      // TODO: report error
      setErrors({ email: t('user-authentication:login-failed') });
    }
  };

  const isOffline = useIsOffline();

  return (
    <UserAuthenticationComponent
      failedToLoadMagic={failedToLoadMagic}
      handleSubmit={handleSubmit}
      isOffline={isOffline}
    >
      <SyncFormikErrorsWithRemix />
    </UserAuthenticationComponent>
  );
}
