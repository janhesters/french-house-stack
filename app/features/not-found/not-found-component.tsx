import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-full flex-col bg-white pt-16 pb-12 dark:bg-slate-800">
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-shrink-0 justify-center">
          <Link to="/" className="inline-flex">
            <span className="sr-only">{t('app-name')}</span>
            <img
              className="h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
              alt=""
            />
          </Link>
        </div>

        <div className="py-16">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-500">
              {t('404-error')}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              {t('page-not-found')}
            </h1>

            <p className="mt-2 text-base text-gray-500 dark:text-slate-400">
              {t('sorry-we-could-not-find-page')}
            </p>

            <div className="mt-6">
              <Link
                to={'/'}
                className="text-base font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-400"
              >
                {t('go-back-home')}
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-7xl flex-shrink-0 px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center space-x-4">
          <Link
            to="#"
            className="text-sm font-medium text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-500"
          >
            {t('contact-support')}
          </Link>
          <span
            className="inline-block border-l border-gray-300 dark:border-gray-200"
            aria-hidden="true"
          />
          <Link
            to="#"
            className="text-sm font-medium text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-500"
          >
            {t('status')}
          </Link>
          <span
            className="inline-block border-l border-gray-300 dark:border-gray-200"
            aria-hidden="true"
          />
          <Link
            to="#"
            className="text-sm font-medium text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-500"
          >
            {t('twitter')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
