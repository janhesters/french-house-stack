import { Form } from '@remix-run/react';
import { isPast } from 'date-fns';
import { TriangleAlertIcon } from 'lucide-react';
import { Trans } from 'react-i18next';

import { Strong, Text } from '~/components/text';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Separator } from '~/components/ui/separator';
import { TypographyH2 } from '~/components/ui/typography';

import { useTranslation } from '../localization/use-translation';

export function toPercentInteger(current: number, max: number) {
  if (max <= 0 || current <= 0) return 0;

  if (current >= max) return 100;

  const percentage = (current / max) * 100;
  return Math.round(percentage);
}

export type UsageCardComponentProps = {
  currentPercent: number;
  currentValue: string;
  maxValue: string;
  title: string;
};

export const UsageCardComponent = ({
  currentPercent,
  currentValue,
  maxValue,
  title,
}: UsageCardComponentProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      <Progress aria-valuenow={currentPercent} value={currentPercent} />

      <div className="flex justify-between">
        <Text>{currentValue}</Text>

        <Text>{maxValue}</Text>
      </div>
    </CardContent>
  </Card>
);

export type BillingPageComponentProps = {
  cancelAtPeriodEnd: boolean;
  /**
   * Empty string if there is no subscription in the database for the given
   * organization.
   */
  currentPeriodEnd: string;
  currentSeats: number;
  currentTierName: string;
  currentUsage: number;
  maxSeats: number;
  maxUsage: number;
};

export function BillingPageComponent({
  currentTierName,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  currentSeats,
  currentUsage,
  maxSeats,
  maxUsage,
}: BillingPageComponentProps) {
  const { t } = useTranslation('billing');
  const isPeriodEndPast = isPast(new Date(currentPeriodEnd));
  const hasReachedUsageLimit = currentUsage >= maxUsage;

  return (
    <main className="mx-auto max-w-xl space-y-6 p-4">
      <div>
        <TypographyH2 className="border-none pb-0 text-lg font-medium">
          {t('title')}
        </TypographyH2>

        <Text className="mt-0">{t('description')}</Text>
      </div>

      <Separator />

      {hasReachedUsageLimit && (
        <Alert aria-live="polite" variant="destructive">
          <TriangleAlertIcon aria-hidden="true" className="h-4 w-4" />

          <AlertTitle>{t('usage-limit-reached')}</AlertTitle>

          <AlertDescription>
            {t('usage-limit-reached-description')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>{t('subscription')}</CardTitle>

            <CardDescription>
              <Trans
                components={{ 1: <Strong /> }}
                i18nKey="billing:your-subscription"
                values={{ currentTierName }}
              />

              <br />
              <br />

              {Boolean(currentPeriodEnd) &&
                (cancelAtPeriodEnd ? (
                  isPeriodEndPast ? (
                    <Trans
                      components={{ 1: <Strong /> }}
                      i18nKey="billing:subscription-has-ended"
                      values={{ currentPeriodEnd }}
                    />
                  ) : (
                    <Trans
                      components={{ 1: <Strong /> }}
                      i18nKey="billing:subscription-will-run-out"
                      values={{ currentPeriodEnd }}
                    />
                  )
                ) : (
                  <Trans
                    components={{ 1: <Strong /> }}
                    i18nKey="billing:next-billing-date"
                    values={{ currentPeriodEnd }}
                  />
                ))}
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Form method="post" replace>
              <Button type="submit">{t('manage-subscription')}</Button>
            </Form>
          </CardFooter>
        </Card>

        <UsageCardComponent
          title={t('usage')}
          currentPercent={toPercentInteger(currentUsage, maxUsage)}
          currentValue={`${currentUsage} GB`}
          maxValue={`${maxUsage} GB`}
        />

        <UsageCardComponent
          title={t('seats')}
          currentPercent={toPercentInteger(currentSeats, maxSeats)}
          currentValue={t('seats-taken', { currentSeats })}
          maxValue={t('seats-max', { maxSeats })}
        />
      </div>
    </main>
  );
}
