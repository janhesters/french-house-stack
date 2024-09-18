/* eslint-disable unicorn/consistent-function-scoping */
import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import {
  createRemixStub,
  render,
  screen,
  within,
} from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import type {
  BillingPageComponentProps,
  UsageCardComponentProps,
} from './billing-page-component';
import {
  BillingPageComponent,
  toPercentInteger,
  UsageCardComponent,
} from './billing-page-component';

describe('toPercentInteger()', () => {
  test('given a current value of 50 and a max value of 100: returns 50', () => {
    const actual = toPercentInteger(50, 100);
    const expected = 50;

    expect(actual).toEqual(expected);
  });

  test('given a current value of 25 and a max value of 200: returns 13', () => {
    const actual = toPercentInteger(25, 200);
    const expected = 13;

    expect(actual).toEqual(expected);
  });

  test('given a current value of 1 and a max value of 3: returns 33', () => {
    const actual = toPercentInteger(1, 3);
    const expected = 33;

    expect(actual).toEqual(expected);
  });

  test('given zero current value and any max value: returns 0', () => {
    const actual = toPercentInteger(0, 100);
    const expected = 0;

    expect(actual).toEqual(expected);
  });

  test('given a current value equal to max value: returns 100', () => {
    const actual = toPercentInteger(100, 100);
    const expected = 100;

    expect(actual).toEqual(expected);
  });

  test('given a current value more than max value: returns 100', () => {
    const actual = toPercentInteger(150, 100);
    const expected = 100;

    expect(actual).toEqual(expected);
  });

  test('given a negative max value: returns 0', () => {
    const actual = toPercentInteger(50, -100);
    const expected = 0;

    expect(actual).toEqual(expected);
  });

  test('given a negative current value: returns 0', () => {
    const actual = toPercentInteger(-50, 100);
    const expected = 0;

    expect(actual).toEqual(expected);
  });
});

describe('BillingPageComponent with Remix', () => {
  const createProps: Factory<BillingPageComponentProps> = ({
    cancelAtPeriodEnd = faker.datatype.boolean(),
    currentPeriodEnd = faker.date.soon().toISOString(),
    currentSeats = faker.number.int({ min: 1, max: 10 }),
    currentTierName = faker.helpers.arrayElement(['Free', 'Pro', 'Enterprise']),
    currentUsage = faker.number.int({ min: 0, max: 500 }),
    maxSeats = currentSeats + faker.number.int({ min: 1, max: 10 }),
    maxUsage = faker.number.int({ min: currentUsage, max: 1000 }),
  } = {}) => ({
    cancelAtPeriodEnd,
    currentPeriodEnd,
    currentSeats,
    currentTierName,
    currentUsage,
    maxSeats,
    maxUsage,
  });

  function renderBillingPageComponent(props: BillingPageComponentProps) {
    const path = '/billing';
    const RemixStub = createRemixStub([
      { path, Component: () => <BillingPageComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);
  }

  test('given any props: renders a title and a description', () => {
    const props = createProps();

    renderBillingPageComponent(props);

    expect(
      screen.getByRole('heading', { name: /billing/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/manage your subscription/i)).toHaveAttribute(
      'type',
      'submit',
    );
  });

  test('given the current contract is NOT set to cancel at the end of the period: shows when the contract will be prolonged', () => {
    const props = createProps({ cancelAtPeriodEnd: false });

    renderBillingPageComponent(props);

    expect(screen.getByText(/your next billing date is:/i)).toBeInTheDocument();
    expect(screen.getByText(props.currentPeriodEnd)).toBeInTheDocument();
  });

  test('given the current contract is set to cancel at the end of the period: shows when the contract will be canceled', () => {
    const props = createProps({ cancelAtPeriodEnd: true });

    renderBillingPageComponent(props);

    expect(
      screen.getByText(
        /your subscription is cancelled. your current subscription will end on:/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(props.currentPeriodEnd)).toBeInTheDocument();
  });

  test('given the current contract is set to cancel and the current period end is in the past: shows the contract has been canceled', () => {
    const props = createProps({
      cancelAtPeriodEnd: true,
      currentPeriodEnd: faker.date.past().toISOString(),
    });

    renderBillingPageComponent(props);

    expect(
      screen.getByText(/your last subscription has ended on:/i),
    ).toBeInTheDocument();
    expect(screen.getByText(props.currentPeriodEnd)).toBeInTheDocument();
  });

  test('given any tier and usage and seats less than their maximums: shows the current tier, as well as the current and maximum usage and seats', () => {
    const props = createProps();

    renderBillingPageComponent(props);

    expect(
      screen.getByRole('heading', { level: 3, name: /subscription/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(props.currentTierName)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /usage/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /seats/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`taken: ${props.currentSeats}`, 'i')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`max: ${props.maxSeats}`, 'i')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${props.currentUsage} GB`, 'i')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${props.maxUsage} GB`, 'i')),
    ).toBeInTheDocument();
  });

  test('given any tier and usage is at the maximum: shows a warning', () => {
    const props = createProps({ currentUsage: 1000, maxUsage: 1000 });

    renderBillingPageComponent(props);

    // It renders a warning.
    expect(
      within(screen.getByRole('alert')).getByRole('heading', {
        level: 5,
        name: /usage limit reached/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /usage/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(new RegExp(`${props.currentUsage} GB`, 'i')),
    ).toHaveLength(2);
  });
});

// const createProps: = ({ ...props } = {}) => ({
//   ...props,
// });

describe('UsageCardComponent', () => {
  const createProps: Factory<UsageCardComponentProps> = ({
    currentPercent = 50,
    currentValue = '150 GB',
    maxValue = '300 GB',
    title = 'Data Usage',
  } = {}) => ({
    currentPercent,
    currentValue,
    maxValue,
    title,
  });

  test('given props: renders title, current and max values, and updates progress bar accurately', () => {
    const props = createProps({
      currentPercent: 75,
      currentValue: '200 GB',
      maxValue: '400 GB',
      title: 'Data Usage',
    });
    render(<UsageCardComponent {...props} />);

    // Check for the title
    expect(screen.getByText(props.title)).toBeInTheDocument();

    // Check for the current and maximum values
    expect(screen.getByText(props.currentValue)).toBeInTheDocument();
    expect(screen.getByText(props.maxValue)).toBeInTheDocument();

    // Check for the progress bar properties
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute(
      'aria-valuenow',
      String(props.currentPercent),
    );

    // Check for the progress bar visual state based on style transform
    const progressBarInner = progressBar.firstChild;
    expect(progressBarInner).toHaveStyle(
      `transform: translateX(-${100 - props.currentPercent}%);`,
    );
  });
});
