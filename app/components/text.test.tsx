import { describe, expect, test } from 'vitest';

import { createRemixStub, render, screen } from '~/test/react-test-utils';

import { Code, Strong, Text, TextLink } from './text';

describe('Text component', () => {
  test('given text as children: renders the text', () => {
    render(<Text>Sample Text</Text>);

    expect(screen.getByText('Sample Text')).toBeInTheDocument();
  });
});

describe('TextLink component', () => {
  test('given text as children and a link: renders the text and has the correct href', () => {
    const href = '/test-link';
    const RemixStub = createRemixStub([
      { path: '/', Component: () => <TextLink to={href}>Link Text</TextLink> },
    ]);

    render(<RemixStub />);

    expect(screen.getByRole('link', { name: 'Link Text' })).toHaveAttribute(
      'href',
      href,
    );
  });
});

describe('Text components', () => {
  test('given text as children: renders the text with the correct class', () => {
    render(<Strong>Strong Text</Strong>);

    expect(screen.getByText('Strong Text')).toHaveClass('font-medium');
  });
});

describe('Text components', () => {
  test('given text as children: renders the text with the correct class', () => {
    render(<Code>Code Snippet</Code>);

    expect(screen.getByText('Code Snippet')).toHaveClass('font-mono');
  });
});
