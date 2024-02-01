import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { createRemixStub, render, screen } from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import type { CardPaginationProps } from './card-pagination';
import { CardPagination } from './card-pagination';

const createProps: Factory<CardPaginationProps> = ({
  currentPage = faker.number.int({ min: 1, max: 3 }),
  perPage = 10,
  totalItemCount = faker.number.int({ min: 21, max: 30 }),
} = {}) => ({ currentPage, perPage, totalItemCount });

describe('CardPagination component', () => {
  test('given 1 total item and being on the first page: renders the correct message, and disables both the next page and the previous page button', () => {
    const props = createProps({ currentPage: 1, totalItemCount: 1 });
    const path = '/';
    const RemixStub = createRemixStub([
      { path, Component: () => <CardPagination {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(screen.getByText(/showing/i, { selector: 'p' })).toHaveTextContent(
      'Showing 1 to 1 of 1 results',
    );
    expect(
      screen.queryByRole('link', { name: /previous/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /next/i }),
    ).not.toBeInTheDocument();
  });

  test('given more than 10 total items and being on the first page: renders the correct message, and disables both the previous page button', () => {
    const props = createProps({ currentPage: 1 });
    const path = '/';
    const RemixStub = createRemixStub([
      { path, Component: () => <CardPagination {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(screen.getByText(/showing/i, { selector: 'p' })).toHaveTextContent(
      `Showing 1 to 10 of ${props.totalItemCount} results`,
    );
    expect(
      screen.queryByRole('link', { name: /previous/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /next/i })).toHaveAttribute(
      'href',
      '/?page=2',
    );
  });

  test('given more than 10 total items and being on the second page: renders the correct message, and enables both the previous page and the next page button', () => {
    const props = createProps({ currentPage: 2 });
    const path = '/';
    const RemixStub = createRemixStub([
      { path, Component: () => <CardPagination {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(screen.getByText(/showing/i, { selector: 'p' })).toHaveTextContent(
      `Showing 11 to 20 of ${props.totalItemCount} results`,
    );
    expect(screen.queryByRole('link', { name: /previous/i })).toHaveAttribute(
      'href',
      '/?page=1',
    );
    expect(screen.queryByRole('link', { name: /next/i })).toHaveAttribute(
      'href',
      '/?page=3',
    );
  });

  test('given more than 10 total items and being on the last page: renders the correct message, and disables both the next page button', () => {
    const props = createProps({ currentPage: 3 });
    const path = '/';
    const RemixStub = createRemixStub([
      { path, Component: () => <CardPagination {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(screen.getByText(/showing/i, { selector: 'p' })).toHaveTextContent(
      `Showing 21 to ${props.totalItemCount} of ${props.totalItemCount} results`,
    );
    expect(screen.queryByRole('link', { name: /previous/i })).toHaveAttribute(
      'href',
      '/?page=2',
    );
    expect(
      screen.queryByRole('link', { name: /next/i }),
    ).not.toBeInTheDocument();
  });
});
