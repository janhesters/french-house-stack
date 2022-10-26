import { LockClosedIcon } from '@heroicons/react/24/solid';
import { XCircleIcon } from '@heroicons/react/24/solid';
import type { FormikHelpers } from 'formik';
import {
  ErrorMessage as FormikErrorMessage,
  Field,
  Form,
  Formik,
} from 'formik';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

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
export type UserAuthenticationInitialValues = typeof initialValues;

export type HandleSubmit = (
  values: {
    email: string;
  },
  formikHelpers: FormikHelpers<UserAuthenticationInitialValues>,
) => void | Promise<any>;

export type UserAuthenticationComponentProps = {
  children: ReactNode;
  failedToLoadMagic: boolean;
  handleSubmit: HandleSubmit;
  isOffline: boolean;
};

export default function UserAuthenticationComponent({
  children,
  failedToLoadMagic,
  handleSubmit,
  isOffline,
}: UserAuthenticationComponentProps) {
  const { t } = useTranslation();

  return (
    <>
      <header className="sr-only">
        <h1>{t('user-authentication:sign-in-or-sign-up')}</h1>
      </header>

      <main className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt={t('app-name')}
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('user-authentication:sign-in-to-your-account')}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm text-gray-600">
              {t('user-authentication:or-create-account')}
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            initialErrors={{ email: '' }}
            validationSchema={yup.object().shape({
              email: yup
                .string()
                .email(t('user-authentication:email-invalid'))
                .required(t('user-authentication:email-required')),
            })}
          >
            {({ errors, isSubmitting, isValid, touched }) => (
              <Form className="mt-8 space-y-6">
                <div className="-space-y-px rounded-md shadow-sm">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      {t('user-authentication:email-address')}
                    </label>
                    <Field
                      aria-describedby={
                        (errors.email && touched.email) ||
                        isOffline ||
                        failedToLoadMagic
                          ? 'email-error'
                          : undefined
                      }
                      aria-invalid={
                        errors.email && touched.email ? 'true' : undefined
                      }
                      aria-label={t('user-authentication:email-address')}
                      aria-required="true"
                      autoComplete="email"
                      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      id="email"
                      name="email"
                      placeholder={t('user-authentication:email-placeholder')}
                      required
                      type="email"
                    />
                  </div>
                </div>

                {children}

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
                      ? t('user-authentication:authenticating')
                      : t('user-authentication:sign-in-sign-up')}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          {isOffline && (
            <ErrorMessage
              errorMessage={t('user-authentication:offline-warning')}
            />
          )}

          {failedToLoadMagic && (
            <ErrorMessage
              errorMessage={t('user-authentication:failed-to-load-magic')}
            />
          )}
        </div>
      </main>
    </>
  );
}
