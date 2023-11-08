import { describe, expect, test } from 'vitest';

import { createRemixStub, render, screen } from '~/test/react-test-utils';

import { NotFoundComponent } from './not-found-component';

describe('NotFound component', () => {
  test('given a link: renders error messages and the correct link', async () => {
    const path = '/some-non-existent-page';
    const RemixStub = createRemixStub([
      { path, Component: props => <NotFoundComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /not found/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
