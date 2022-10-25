import { LockClosedIcon } from '@heroicons/react/24/solid';
import { XCircleIcon } from '@heroicons/react/24/solid';
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useSubmit, useTransition } from '@remix-run/react';
import {
  ErrorMessage as FormikErrorMessage,
  Field,
  Form,
  Formik,
  useFormikContext,
} from 'formik';
import { Magic } from 'magic-sdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import i18next from '~/features/localization/i18next.server';
import magicAdmin from '~/features/user-authentication/magic-admin.server';
import {
  createUserSession,
  getUserId,
} from '~/features/user-authentication/user-authentication-session.server';
import useEffectOnce from '~/hooks/use-effect-once';
import useIsOffline from '~/hooks/use-is-offline';
import usePromise from '~/hooks/use-promise';
import getSafeRedirectDestination from '~/utils/get-safe-redirect-destination';

export const handle = { i18n: 'login' };

type LoaderData = { title: string };

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  if (userId) {
    const redirectTo = getSafeRedirectDestination(request, '/home');
    return redirect(redirectTo);
  }

  const t = await i18next.getFixedT(request);

  return json<LoaderData>({
    title: `${t('login:sign-in-sign-up')} | ${t('app-name')}`,
  });
};

export const meta: MetaFunction = ({ data }) => {
  const { title } = data as LoaderData;

  return { title };
};

type ActionData = { errorMessage?: string };

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const didToken = formData.get('didToken');

  const t = await i18next.getFixedT(request);

  if (typeof didToken !== 'string') {
    // TODO: report error.
    return json<ActionData>(
      { errorMessage: t('login:did-token-malformed-error') },
      { status: 400 },
    );
  }

  const { issuer } = await magicAdmin.users.getMetadataByToken(didToken);

  if (typeof issuer !== 'string') {
    // TODO: report error.
    return json<ActionData>(
      { errorMessage: t('login:missing-issuer-metadata') },
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

const ErrorMessage = ({ errorMessage }: { errorMessage: string }) => (
  <div className="rounded-md bg-red-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <p id="email-error" className="text-sm text-red-700">
          {errorMessage}
        </p>
      </div>
    </div>
  </div>
);

const initialValues = { email: '' };

const SyncFormikErrorsWithRemix = () => {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const state: 'idle' | 'error' | 'submitting' = transition.submission
    ? 'submitting'
    : actionData?.errorMessage
    ? 'error'
    : 'idle';

  const { setSubmitting, setErrors } = useFormikContext<typeof initialValues>();

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
  const isOffline = useIsOffline();

  return (
    <main className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt={t('app-name')}
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('login:sign-in-to-your-account')}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-center text-sm text-gray-600">
            {t('login:or-create-account')}
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          onSubmit={async ({ email }, { setErrors }) => {
            try {
              const { magic } = await magicReady;
              const didToken = await magic.auth.loginWithMagicLink({ email });

              if (!didToken) {
                // TODO: report error
                throw new Error(t('login:did-token-missing'));
              } else {
                submit({ didToken }, { method: 'post', replace: true });
              }
            } catch {
              // TODO: report error
              setErrors({ email: t('login:login-failed') });
            }
          }}
          initialErrors={{ email: '' }}
          validationSchema={yup.object().shape({
            email: yup
              .string()
              .email(t('login:email-invalid'))
              .required(t('login:email-required')),
          })}
        >
          {({ errors, isSubmitting, isValid, touched }) => (
            <Form className="mt-8 space-y-6">
              <div className="-space-y-px rounded-md shadow-sm">
                <div>
                  <label htmlFor="email" className="sr-only">
                    {t('login:email-address')}
                  </label>
                  <Field
                    aria-describedby={
                      errors.email && touched.email ? 'email-error' : undefined
                    }
                    aria-invalid={
                      errors.email && touched.email ? 'true' : undefined
                    }
                    aria-label={t('login:email-address')}
                    aria-required="true"
                    autoComplete="email"
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    id="email"
                    name="email"
                    placeholder={t('login:email-placeholder')}
                    required
                    type="email"
                  />
                </div>
              </div>

              <SyncFormikErrorsWithRemix />

              <FormikErrorMessage name="email">
                {errorMessage => <ErrorMessage errorMessage={errorMessage} />}
              </FormikErrorMessage>

              <div>
                <button
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  disabled={
                    isSubmitting || !isValid || isOffline || failedToLoadMagic
                  }
                  type="submit"
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  </span>
                  {isSubmitting
                    ? t('login:authenticating')
                    : t('login:sign-in-sign-up')}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {isOffline && (
          <ErrorMessage errorMessage={t('login:offline-warning')} />
        )}

        {failedToLoadMagic && (
          <ErrorMessage errorMessage={t('login:failed-to-load-magic')} />
        )}
      </div>
    </main>
  );
}
