import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { buttonVariants } from '~/components/ui/button';

export function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">{t('404-error')}</p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t('page-not-found')}
        </h1>

        <p className="mt-6 text-base leading-7 text-muted-foreground">
          {t('sorry-we-could-not-find-page')}
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link className={buttonVariants()} to="/">
            {t('go-back-home')}
          </Link>
        </div>
      </div>
    </main>
  );
}
