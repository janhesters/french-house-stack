import { describe, expect, test } from 'vitest';

import {
  getBillingPeriodFromRequest,
  stringToBillingPeriod,
} from './billing-helpers.server';

describe('stringToBillingPeriod()', () => {
  test('given "monthly" as input: returns "monthly"', () => {
    const actual = stringToBillingPeriod('monthly');
    const expected = 'monthly';

    expect(actual).toStrictEqual(expected);
  });

  test('given "annually" as input: returns "annually"', () => {
    const actual = stringToBillingPeriod('annually');
    const expected = 'annually';

    expect(actual).toStrictEqual(expected);
  });

  test('given null as input: returns "annually"', () => {
    const actual = stringToBillingPeriod(null);
    const expected = 'annually';

    expect(actual).toStrictEqual(expected);
  });

  test('given an unexpected string as input: returns "annually"', () => {
    const actual = stringToBillingPeriod('weekly');
    const expected = 'annually';

    expect(actual).toStrictEqual(expected);
  });
});

describe('getBillingPeriodFromRequest()', () => {
  test('given a request with a query string for "billingPeriod=monthly": returns "monthly"', () => {
    const request = new Request('https://example.com?billingPeriod=monthly');

    const actual = getBillingPeriodFromRequest(request);
    const expected = 'monthly';

    expect(actual).toStrictEqual(expected);
  });

  test('given a request with a query string for "billingPeriod=annually": returns "annually"', () => {
    const request = new Request('https://example.com?billingPeriod=annually');

    const actual = getBillingPeriodFromRequest(request);
    const expected = 'annually';

    expect(actual).toStrictEqual(expected);
  });

  test('given a request without a "billingPeriod" parameter: returns "annually"', () => {
    const request = new Request('https://example.com');

    const actual = getBillingPeriodFromRequest(request);
    const expected = 'annually';

    expect(actual).toStrictEqual(expected);
  });

  test('given a request with an invalid "billingPeriod" value: returns "annually"', () => {
    const request = new Request('https://example.com?billingPeriod=weekly');

    const actual = getBillingPeriodFromRequest(request);
    const expected = 'annually';

    expect(actual).toStrictEqual(expected);
  });
});
