import { LockClosedIcon } from '@heroicons/react/solid';
import { XCircleIcon } from '@heroicons/react/solid';
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
import * as yup from 'yup';

import magicAdmin from '~/features/user-authentication/magic-admin.server';
import {
  createUserSession,
  getUserId,
} from '~/features/user-authentication/user-authentication-session.server';
import useEffectOnce from '~/hooks/use-effect-once';
import useIsOffline from '~/hooks/use-is-offline';
import usePromise from '~/hooks/use-promise';
import getSafeRedirectDestination from '~/utils/get-safe-redirect-destination';

export const meta: MetaFunction = () => ({
  title: 'Sign In / Sign Up | French House Stack',
});

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  if (userId) {
    const redirectTo = getSafeRedirectDestination(request, '/home');
    return redirect(redirectTo);
  }

  return json({});
};

type ActionData = {
  errorMessage?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const didToken = formData.get('didToken');

  if (typeof didToken !== 'string') {
    // TODO: report error.
    return json<ActionData>(
      { errorMessage: 'A DID token must be a string.' },
      { status: 400 },
    );
  }

  const { issuer } = await magicAdmin.users.getMetadataByToken(didToken);

  if (typeof issuer !== 'string') {
    // TODO: report error.
    return json<ActionData>(
      { errorMessage: 'Missing issuer from Magic metadata.' },
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
        testMode: Boolean(window.Cypress),
      });
      await magic.preload();
      setMagicReady({ magic });
    }

    downloadMagicStaticAssets().catch(() => {
      // TODO: Report error
      setFailedToLoadMagic(true);
    });
  });

  const submit = useSubmit();

  const isOffline = useIsOffline();

  return (
    <main className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 mx-auto max-w-xs text-center text-sm text-gray-600">
            Or create an account. Both works through this email field here 👇
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
                throw new Error('Login failed - no DID token.');
              } else {
                submit({ didToken }, { method: 'post', replace: true });
              }
            } catch {
              // TODO: report error
              setErrors({ email: 'Login failed. Please try again.' });
            }
          }}
          initialErrors={{ email: '' }}
          validationSchema={yup.object().shape({
            email: yup
              .string()
              .email("A valid email consists of characters, '@' and '.'.")
              .required('Please enter a valid email (required).'),
          })}
        >
          {({ errors, isSubmitting, isValid, touched }) => (
            <Form className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <Field
                    aria-describedby={
                      errors.email && touched.email ? 'email-error' : undefined
                    }
                    aria-invalid={
                      errors.email && touched.email ? 'true' : undefined
                    }
                    aria-label="Email"
                    aria-required="true"
                    autoComplete="email"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    id="email"
                    name="email"
                    placeholder="Your email address ..."
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
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none"
                  disabled={
                    isSubmitting || !isValid || isOffline || failedToLoadMagic
                  }
                  type="submit"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  </span>
                  {isSubmitting ? 'Authenticating ...' : 'Sign in / Sign up'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {isOffline && (
          <ErrorMessage errorMessage="You're offline. Please connect to the internet again." />
        )}

        {failedToLoadMagic && (
          <ErrorMessage errorMessage="Failed to load authentication provider https://magic.link. Please reload the page to try again." />
        )}
      </div>
    </main>
  );
}
