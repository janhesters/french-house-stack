import { faker } from '@faker-js/faker';
import type { FormProps } from '@remix-run/react';
import userEvent from '@testing-library/user-event';
import type { RefAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '~/test/test-utils';
import type { Factory } from '~/utils/types';

import type { UserProfileComponentProps } from './user-profile-component';
import UserProfile from './user-profile-component';

vi.mock('remix-forms', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await vi.importActual<typeof import('remix-forms')>(
    'remix-forms',
  );
  return {
    ...original,
    Form: (props: FormProps & RefAttributes<HTMLFormElement>) => (
      <form {...props} />
    ),
  };
});

const createProps: Factory<UserProfileComponentProps> = ({
  avatar = faker.image.avatar(),
  email = faker.internet.email(),
  name = faker.name.fullName(),
  success = false,
} = {}) => ({ avatar, email, name, success });

// TODO: fix when Remix unit test utils are available.
// see: https://github.com/remix-run/remix/discussions/2481
describe.skip('UserProfile component', () => {
  it("given a user's avatar, email and name and no success: renders the correct headings and the user's avatar, email and name and hide the success banner", async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<UserProfile {...props} />);

    // It renders the correct headings and a message.
    expect(
      screen.getByRole('heading', { name: /settings/i, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /profile/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/information will be displayed publicly/i),
    ).toBeInTheDocument();

    // It renders the user's avatar, and email, but those can't be changed.
    expect(screen.getByAltText(/avatar/i)).toHaveAttribute('src', props.avatar);
    expect(screen.getByLabelText(/name/i)).toHaveValue(props.name);

    // Lets the user change their name.
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveValue(props.email);
    const email = faker.internet.email();
    await user.type(emailInput, email);
    expect(emailInput).toHaveValue(email);

    // It has a submit button to save the changes.
    expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute(
      'type',
      'submit',
    );

    // It has a button to cancel the changes.
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/settings/profile',
    );

    // It hides the success banner.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('given a success: renders the success banner', () => {
    const props = createProps({ success: true });

    render(<UserProfile {...props} />);

    // It renders the success banner.
    expect(screen.getByRole('alert')).toHaveTextContent(/success/i);
    expect(screen.getByRole('link', { name: /dismiss/i })).toHaveAttribute(
      'href',
      '/settings/profile',
    );
  });
});
