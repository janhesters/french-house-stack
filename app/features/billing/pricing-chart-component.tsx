import { Link } from '@remix-run/react';
import { CheckIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button, buttonVariants } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/utils/shadcn-ui';

import { useTranslation } from '../localization/use-translation';

export type TierCardComponentProps = {
  /** The CTA button can either be a link, or a submit button in a form. */
  action: 'href' | 'intent';
  /**
   * The href path to navigate to for links, or the value of the intent for
   * forms.
   */
  actionValue: string;
  className?: string;
  cta: string;
  description: string;
  features: string[];
  mostPopular?: boolean;
  name: string;
  price: string;
  priceSuffix?: string;
};

function TierCardComponent({
  action,
  actionValue,
  className,
  cta,
  description,
  features,
  mostPopular = false,
  name,
  price,
  priceSuffix,
}: TierCardComponentProps) {
  const { t } = useTranslation('pricing');

  return (
    <Card
      className={cn(
        'w-full',
        mostPopular && 'ring-2 ring-primary dark:bg-border/50',
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn(
              'text-lg font-semibold',
              mostPopular && 'text-primary',
            )}
          >
            {name}
          </CardTitle>

          {mostPopular && (
            <Badge
              className="rounded-full border-primary bg-primary/10 text-primary dark:border-transparent dark:bg-primary dark:text-primary-foreground"
              variant="outline"
            >
              {t('most-popular')}
            </Badge>
          )}
        </div>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="flex items-baseline gap-x-1">
          <span className="text-4xl font-bold tracking-tight">{price}</span>

          {priceSuffix && (
            <span className="text-sm font-semibold text-muted-foreground">
              {priceSuffix}
            </span>
          )}
        </p>

        {action === 'href' ? (
          <Link className={cn(buttonVariants(), 'w-full')} to={actionValue}>
            {cta}
          </Link>
        ) : (
          <form method="post">
            <Button className="w-full" name="intent" value={actionValue}>
              {cta}
            </Button>
          </form>
        )}

        <ul className="space-y-3">
          {features.map(feature => (
            <li
              key={feature}
              className="flex items-center gap-x-3 text-sm text-muted-foreground"
            >
              <CheckIcon
                aria-hidden="true"
                className="size-5 flex-none text-primary dark:text-foreground"
              />

              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export type PricingChartComponentProps = {
  tiers: TierCardComponentProps[];
};

export function PricingChartComponent({ tiers }: PricingChartComponentProps) {
  return (
    <ul
      className={cn(
        'mx-auto grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3',
        tiers.length > 3 && '2xl:grid-cols-4',
      )}
    >
      {tiers.map(tier => (
        <li className="flex" key={tier.name}>
          <TierCardComponent
            className={cn(tiers.length === 1 && 'xl-col-span-2 xl:col-start-2')}
            {...tier}
          />
        </li>
      ))}
    </ul>
  );
}
