import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { getValidPageFromRequest, withCurrentPage } from './pagination.server';

describe('getValidPageFromRequest()', () => {
  test('given a request with no query string and the total item count: returns the default page', () => {
    const request = new Request(faker.internet.url());
    const totalItemCount = faker.number.int({
      min: 1,
      max: 100,
    });

    expect(getValidPageFromRequest({ request, totalItemCount })).toEqual(1);
  });

  test('given a request with a query string that has a page number and the total item count: returns the page', () => {
    const page = faker.number.int({ min: 1, max: 3 });
    const totalItemCount = faker.number.int({
      min: 21,
      max: 100,
    });
    const request = new Request(`${faker.internet.url()}?page=${page}`);

    expect(getValidPageFromRequest({ request, totalItemCount })).toEqual(page);
  });

  test('given a request with a query string that has a page number that is too high and the total item count: returns the last page', () => {
    const page = faker.number.int({ min: 11 });
    const totalItemCount = faker.number.int({
      min: 21,
      max: 100,
    });
    const request = new Request(`${faker.internet.url()}?page=${page}`);

    expect(getValidPageFromRequest({ request, totalItemCount })).toEqual(
      Math.ceil(totalItemCount / 10),
    );
  });

  test('given a request with a query string that has a page and other params and the total item count: ignores the other query param and returns the page', () => {
    const page = faker.number.int({ min: 1, max: 3 });
    const request = new Request(
      `${faker.internet.url()}?${new URLSearchParams({
        page: page.toString(),
        otherParam: faker.word.sample(),
      }).toString()}`,
    );
    const totalItemCount = faker.number.int({
      min: 21,
      max: 100,
    });

    expect(getValidPageFromRequest({ request, totalItemCount })).toEqual(page);
  });

  test('given a request with a query string that has a non-numeric page and the total item count: returns the default page', () => {
    const request = new Request(
      `${faker.internet.url()}?${new URLSearchParams({
        page: faker.word.sample(),
      }).toString()}`,
    );
    const totalItemCount = faker.number.int({
      min: 1,
      max: 100,
    });

    expect(getValidPageFromRequest({ request, totalItemCount })).toEqual(1);
  });

  test('given a request with a query string that has a non-positive page and the total item count: returns the default page', () => {
    const request = new Request(
      `${faker.internet.url()}?${new URLSearchParams({
        page: faker.number.int({ min: -100, max: -1 }).toString(),
      }).toString()}`,
    );
    const totalItemCount = faker.number.int({
      min: 1,
      max: 100,
    });

    expect(getValidPageFromRequest({ request, totalItemCount })).toEqual(1);
  });

  test('given a request with a query string that has a page and the total item count is zero: returns the default page', () => {
    const request = new Request(
      `${faker.internet.url()}?page=${faker.number.int({
        min: 1,
        max: 100,
      })}`,
    );
    const totalItemCount = 0;

    expect(getValidPageFromRequest({ request, totalItemCount })).toEqual(1);
  });

  test('given a request with a page and the total item count and a custom perPage value: returns the correct page', () => {
    const page = faker.number.int({ min: 1, max: 3 });
    const totalItemCount = faker.number.int({
      min: 41,
      max: 100,
    });
    const perPage = faker.number.int({ min: 5, max: 20 });
    const request = new Request(`${faker.internet.url()}?page=${page}`);

    expect(
      getValidPageFromRequest({ request, totalItemCount, perPage }),
    ).toEqual(page);
  });

  test('given a request with a page number that is too high and the total item count and a custom perPage value: returns the last page', () => {
    const page = faker.number.int({ min: 11 });
    const totalItemCount = faker.number.int({
      min: 21,
      max: 100,
    });
    const perPage = faker.number.int({ min: 5, max: 20 });
    const request = new Request(`${faker.internet.url()}?page=${page}`);

    expect(
      getValidPageFromRequest({ request, totalItemCount, perPage }),
    ).toEqual(Math.ceil(totalItemCount / perPage));
  });

  test.each([
    { totalItemCount: 100, perPage: 3, page: 3, expected: 3 },
    { totalItemCount: 100, perPage: 20, page: 10, expected: 5 },
  ])(
    'given a custom per page parameter, so that there are plenty more pages: returns the correct page',
    ({ totalItemCount, perPage, page, expected }) => {
      const request = new Request(`${faker.internet.url()}?page=${page}`);

      const actual = getValidPageFromRequest({
        request,
        totalItemCount,
        perPage,
      });

      expect(actual).toEqual(expected);
    },
  );
});

describe('withCurrentPage()', () => {
  test('given an object with a request without a page query and totalItemCount: adds the currentPage to the object', () => {
    const totalItemCount = faker.number.int({
      min: 1,
      max: 100,
    });
    const request = new Request(faker.internet.url());
    const middleware = { request, totalItemCount, otherData: 'data' };

    const actual = withCurrentPage(middleware);
    const expected = {
      ...middleware,
      currentPage: 1,
    };

    expect(actual).toEqual(expected);
  });

  test('given an object with a request with a page query and totalItemCount: adds the currentPage to the object', () => {
    const page = faker.number.int({ min: 1, max: 3 });
    const totalItemCount = faker.number.int({
      min: 21,
      max: 100,
    });
    const request = new Request(`${faker.internet.url()}?page=${page}`);
    const middleware = { request, totalItemCount, otherData: 'data' };

    const actual = withCurrentPage(middleware);
    const expected = {
      ...middleware,
      currentPage: page,
    };

    expect(actual).toEqual(expected);
  });

  test('given an object with a request with a too high page query and totalItemCount: adds the last page as currentPage to the object', () => {
    const page = faker.number.int({ min: 11 });
    const totalItemCount = faker.number.int({
      min: 21,
      max: 100,
    });
    const request = new Request(`${faker.internet.url()}?page=${page}`);
    const middleware = { request, totalItemCount, otherData: 'data' };

    const actual = withCurrentPage(middleware);
    const expected = {
      ...middleware,
      currentPage: Math.ceil(totalItemCount / 10),
    };

    expect(actual).toEqual(expected);
  });
});
