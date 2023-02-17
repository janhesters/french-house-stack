import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Form } from '~/components/form-component';

export type UserProfileComponentProps = {
  email: string;
  name: string;
  success: boolean;
};

export const schema = z.object({
  name: z.string().min(3, 'name-required-and-constraints'),
});

export function UserProfileComponent({
  email,
  name,
  success,
}: UserProfileComponentProps) {
  const { t } = useTranslation('user-profile');

  return (
    <main className="flex-1 xl:overflow-y-auto">
      <div className="mx-auto max-w-3xl py-6 px-4 sm:px-6 lg:py-8 lg:px-8">
        {success && (
          <div className="rounded-md bg-green-50 p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon
                  className="h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
              </div>

              <div className="ml-3">
                <p
                  aria-label={t('success') ?? undefined}
                  className="text-sm font-medium text-green-800"
                  role="alert"
                >
                  {t('successful-save')}
                </p>
              </div>

              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <Link
                    className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                    to="/settings/profile"
                  >
                    <span className="sr-only">{t('dismiss-alert')}</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <h1 className="sr-only">{t('settings')}</h1>

        <Form
          buttonLabel={t('save') ?? undefined}
          className="space-y-8 divide-y divide-gray-200 pt-8"
          pendingButtonLabel={t('saving') ?? undefined}
          schema={schema}
          values={{ name }}
        >
          {({ Button, Field }) => (
            <>
              <div className="space-y-8 divide-y divide-gray-200">
                <div>
                  <div>
                    <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {t('profile')}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {t('public-information')}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <p className="flex items-center sm:col-span-6">
                      <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                        {t('email')}
                      </span>

                      <span className="text-blue-gray-900 ml-2 block w-full dark:text-white sm:text-sm">
                        {email}
                      </span>
                    </p>

                    <Field
                      defaultValue={name || ''}
                      label={t('name') ?? undefined}
                      name="name"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <Link
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    to="/settings/profile"
                  >
                    {t('cancel')}
                  </Link>

                  <Button />
                </div>
              </div>
            </>
          )}
        </Form>
      </div>
    </main>
  );
}
