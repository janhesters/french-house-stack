import { describe, expect, it } from 'vitest';

import { createRemixStub, render, screen } from '~/test/test-utils';

import NotFoundComponent from './not-found-component';

describe('NotFound component', () => {
  it('given a link: renders error messages and the correct link', async () => {
    const RemixStub = createRemixStub([
      {
        path: '/some-non-existent-page',
        element: <NotFoundComponent />,
      },
    ]);
    render(<RemixStub />);

    expect(
      screen.getByRole('heading', { level: 1, name: /not found/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /support/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      screen.getByRole('link', { name: /french house stack/i }),
    ).toHaveAttribute('href', '/');
  });
});
