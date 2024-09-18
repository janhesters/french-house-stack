import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { createRemixStub, render, screen } from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import type {
  PricingChartComponentProps,
  TierCardComponentProps,
} from './pricing-chart-component';
import { PricingChartComponent } from './pricing-chart-component';

const createTier: Factory<TierCardComponentProps> = ({
  action = 'intent',
  actionValue = 'subscribe',
  cta = `${faker.company.buzzVerb()} now`,
  description = faker.company.catchPhrase(),
  features = [
    faker.company.catchPhraseAdjective(),
    faker.company.catchPhraseDescriptor(),
  ],
  mostPopular = faker.datatype.boolean(),
  name = faker.company.name(),
  price = faker.commerce.price(),
  priceSuffix = faker.helpers.arrayElement(['', '/month']),
} = {}) => ({
  action,
  actionValue,
  cta,
  description,
  features,
  mostPopular,
  name,
  price,
  priceSuffix,
});

const createProps: Factory<PricingChartComponentProps> = ({
  tiers = [createTier(), createTier(), createTier()],
  ...props
} = {}) => ({ tiers, ...props });

describe('PricingChart component', () => {
  test('given a list of tiers: renders the tiers', () => {
    const props = createProps();

    render(<PricingChartComponent {...props} />);

    props.tiers.forEach(tier => {
      expect(screen.getByText(tier.name)).toBeInTheDocument();
      expect(screen.getByText(tier.description)).toBeInTheDocument();
      expect(screen.getByText(tier.price)).toBeInTheDocument();

      tier.features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: tier.cta }),
      ).toBeInTheDocument();
    });
  });

  test('given a tier with an href: renders the cta as a link', () => {
    const tier = createTier({
      action: 'href',
      actionValue: faker.internet.url(),
    });
    const props = createProps({ tiers: [tier] });
    const path = '/pricing';
    const RemixStub = createRemixStub([
      { path, Component: () => <PricingChartComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(screen.getByRole('link', { name: tier.cta })).toHaveAttribute(
      'href',
      tier.actionValue,
    );
  });
});
