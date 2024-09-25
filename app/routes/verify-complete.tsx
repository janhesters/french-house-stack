import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { Text } from '~/components/text';
import { useTranslation } from '~/features/localization/use-translation';
import { getSearchParameterFromRequest } from '~/utils/get-search-parameter-from-request.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {
    status: getSearchParameterFromRequest('__clerk_status')(request),
    sessions: getSearchParameterFromRequest('__clerk_session')(request),
    action: getSearchParameterFromRequest('action')(request),
  };
};

export const handle = { i18n: ['register', 'login'] };

export default function VerifyComplete() {
  const { t } = useTranslation();
  const { status, action } = useLoaderData<typeof loader>();

  return (
    <main className="flex h-full w-full items-center">
      <div className="mx-auto">
        <Text>
          {status === 'verified'
            ? action === 'login'
              ? t('login:email-verified-description')
              : t('register:email-verified-description')
            : t('register:email-verification-failed-description')}
        </Text>
      </div>
    </main>
  );
}
