import { LockClosedIcon } from '@heroicons/react/24/solid';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { Form } from '@remix-run/react';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

const Spinner = () => (
  <svg
    aria-hidden="true"
    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      fill="currentColor"
    />
  </svg>
);

const ErrorMessage = ({
  errorMessage,
  id,
}: {
  errorMessage: string;
  id: string;
}) => (
  <div className="rounded-md bg-red-50 p-2 dark:bg-red-300">
    <div className="flex">
      <div className="flex-shrink-0">
        <XCircleIcon
          aria-hidden="true"
          className="h-5 w-5 text-red-400 dark:text-red-600"
        />
      </div>
      <div className="ml-3">
        <p
          className="text-sm text-red-700 dark:text-red-900"
          id={id}
          role="alert"
        >
          {errorMessage}
        </p>
      </div>
    </div>
  </div>
);

export const loginIntent = 'login';

export type UserAuthenticationComponentProps = {
  email?: string;
  emailError?: string;
  formError?: string;
  inputRef?: RefObject<HTMLInputElement>;
  state: 'idle' | 'submitting' | 'error';
};

export function UserAuthenticationComponent({
  email,
  emailError,
  formError,
  inputRef,
  state,
}: UserAuthenticationComponentProps) {
  const { t } = useTranslation('user-authentication');

  return (
    <>
      <header className="sr-only">
        <h1>{t('sign-in-or-sign-up')}</h1>
      </header>

      <main className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt={t('app-name') ?? undefined}
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('sign-in-to-your-account')}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm text-gray-600 dark:text-slate-400">
              {t('or-create-account')}
            </p>
          </div>

          <Form
            aria-describedby={formError && 'form-error'}
            className="mt-8 space-y-6"
            method="post"
            replace={true}
          >
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label className="sr-only" htmlFor="email">
                  {t('email-address')}
                </label>

                <input
                  aria-describedby={emailError && 'email-error'}
                  aria-invalid={Boolean(emailError)}
                  autoComplete="email"
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                  defaultValue={email}
                  disabled={state === 'submitting'}
                  id="email"
                  name="email"
                  placeholder={t('email-placeholder') ?? undefined}
                  ref={inputRef}
                  required
                  type="email"
                />

                {emailError && (
                  <ErrorMessage errorMessage={emailError} id="email-error" />
                )}
              </div>
            </div>

            {formError && (
              <ErrorMessage errorMessage={formError} id="form-error" />
            )}

            <div>
              <button
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={state === 'submitting'}
                name="_intent"
                type="submit"
                value={loginIntent}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {state === 'submitting' ? (
                    <div className="ml-2">
                      <Spinner />
                    </div>
                  ) : (
                    <LockClosedIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                    />
                  )}
                </span>
                {state === 'submitting'
                  ? t('authenticating')
                  : t('sign-in-sign-up')}
              </button>
            </div>
          </Form>
        </div>
      </main>
    </>
  );
}
