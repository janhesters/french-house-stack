import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { getBillingPeriodFromRequest } from '~/features/billing/billing-helpers.server';
import type { TierCardComponentProps } from '~/features/billing/pricing-chart-component';
import { PricingChartComponent } from '~/features/billing/pricing-chart-component';
import { useTranslation } from '~/features/localization/use-translation';

export const handle = { i18n: ['pricing'] };

export async function loader({ request }: LoaderFunctionArgs) {
  const billingPeriod = getBillingPeriodFromRequest(request);

  return { billingPeriod };
}

export default function Pricing() {
  const { t } = useTranslation('pricing');
  const { billingPeriod } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const createTiers = (billingPeriod: 'monthly' | 'annually') =>
    [
      {
        action: 'intent',
        actionValue: 'free',
        cta: t('starter-plan-cta'),
        description: t('starter-plan-description'),
        features: t('starter-plan-features', {
          returnObjects: true,
        }) as unknown as string[],
        name: t('starter-plan-name'),
        price: t('price-free'),
      },
      {
        action: 'intent',
        actionValue: 'subscribe-pro',
        cta: t('pro-plan-cta'),
        description: t('pro-plan-description'),
        features: t('pro-plan-features', {
          returnObjects: true,
        }) as unknown as string[],
        mostPopular: true,
        name: t('pro-plan-name'),
        price: billingPeriod === 'monthly' ? '49.99' : '39.99',
        priceSuffix: t(
          billingPeriod === 'monthly'
            ? 'price-per-month'
            : 'price-per-month-billed-annually',
        ),
      },
      {
        action: 'href',
        actionValue: '/contact-sales',
        cta: t('enterprise-plan-cta'),
        description: t('enterprise-plan-description'),
        features: t('enterprise-plan-features', {
          returnObjects: true,
        }) as unknown as string[],
        name: t('enterprise-plan-name'),
        price: t('price-custom'),
      },
    ] satisfies TierCardComponentProps[];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-4 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="sr-only text-primary">{t('pricing')}</h1>

        <h2 className="mt-2 text-4xl font-bold sm:text-5xl">
          {t('choose-your-plan')}
        </h2>

        <p className="mt-6 text-pretty text-lg text-muted-foreground">
          {t('pricing-description')}
        </p>
      </div>

      <Tabs
        className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl xl:mx-0 xl:max-w-none"
        value={billingPeriod}
        onValueChange={value => {
          const params = new URLSearchParams(searchParams);
          params.set('billingPeriod', value);
          setSearchParams(params);
        }}
      >
        <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row">
          <TabsList>
            <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>

            <TabsTrigger value="annually">{t('annually')}</TabsTrigger>
          </TabsList>

          {billingPeriod === 'monthly' && (
            <p className="text-sm leading-6 text-primary">
              {t('save-annually')}
            </p>
          )}
        </div>

        <TabsContent value="monthly">
          <PricingChartComponent tiers={createTiers('monthly')} />
        </TabsContent>

        <TabsContent value="annually">
          <PricingChartComponent tiers={createTiers('annually')} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
