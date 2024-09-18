import type { ActionFunctionArgs } from '@remix-run/node';
import { useActionData } from '@remix-run/react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { contactSalesAction } from '~/features/billing/billing-actions';
import { ContactSalesTeamComponent } from '~/features/billing/contact-sales-team-component';
import { useTranslation } from '~/features/localization/use-translation';

export const handle = { i18n: ['contact-sales'] };

export async function action({ request }: ActionFunctionArgs) {
  return contactSalesAction({ request });
}

export default function ContactSales() {
  const { t } = useTranslation('contact-sales');

  const actionData = useActionData<typeof contactSalesAction>();

  return (
    <>
      <header className="sr-only">
        <h1>{t('contact-sales')}</h1>
      </header>

      <main className="relative isolate mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <h2 className="sr-only">{t('enterprise-sales')}</h2>

        <div className="mx-auto max-w-2xl lg:py-32">
          {actionData?.success ? (
            <Card>
              <CardHeader className="space-y-6">
                <CardTitle className="text-5xl text-primary">
                  {t('success')}
                </CardTitle>

                <CardDescription className="text-2xl">
                  {t('thank-you')}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <ContactSalesTeamComponent />
          )}
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-44rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-secondary to-primary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </main>
    </>
  );
}
