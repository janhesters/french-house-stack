import { describe, expect, test } from 'vitest';

import { createRemixStub, render, screen } from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import type { DisableableLinkComponentProps } from './disableable-link';
import { DisableableLink } from './disableable-link';

const createProps: Factory<DisableableLinkComponentProps> = ({
  children = 'Click Me',
  disabled = false,
  to = '/test',
  ...rest
} = {}) => ({ children, disabled, to, ...rest });

describe('DisableableLink component', () => {
  test('given the link is enabled: renders a link', () => {
    const props = createProps();
    const RemixStub = createRemixStub([
      { path: '/', Component: () => <DisableableLink {...props} /> },
    ]);

    render(<RemixStub />);

    expect(screen.getByRole('link', { name: /click me/i })).toHaveAttribute(
      'href',
      props.to,
    );
  });

  test('given the link is enabled: does NOT render a link', () => {
    const props = createProps({ disabled: true });
    const RemixStub = createRemixStub([
      { path: '/', Component: () => <DisableableLink {...props} /> },
    ]);

    render(<RemixStub />);

    expect(
      screen.queryByRole('link', { name: /click me/i }),
    ).not.toBeInTheDocument();
  });
});
