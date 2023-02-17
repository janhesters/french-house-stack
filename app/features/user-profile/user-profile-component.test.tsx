/**
 * @vitest-environment jsdom
 */

import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { act, createRemixStub, render, screen } from '~/test/test-utils';
import type { Factory } from '~/utils/types';

import type { UserProfileComponentProps } from './user-profile-component';
import { UserProfileComponent } from './user-profile-component';

const createProps: Factory<UserProfileComponentProps> = ({
  email = faker.internet.email(),
  name = faker.name.fullName(),
  success = false,
} = {}) => ({ email, name, success });

describe('UserProfile component', () => {
  it("given a user's avatar, email and name and no success: renders the correct headings and the user's avatar, email and name and hide the success banner", async () => {
    const user = userEvent.setup();
    const props = createProps();
    const path = '/settings/profile';
    const RemixStub = createRemixStub([
      { path, element: <UserProfileComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

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

    // It renders email, but it can't be changed.
    expect(screen.getByText(props.email)).toBeInTheDocument();

    // Lets the user change their name.
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveValue(props.name);
    const name = faker.name.fullName();
    await act(() => user.clear(nameInput));
    await act(() => user.type(nameInput, name));
    expect(nameInput).toHaveValue(name);

    // It has a submit button to save the changes.
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();

    // It has a button to cancel the changes.
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/settings/profile',
    );

    // It hides the success banner.
    expect(
      screen.queryByRole('alert', { name: /success/i }),
    ).not.toBeInTheDocument();
  });

  it('given a success: renders the success banner', () => {
    const props = createProps({ success: true });
    const path = '/settings/profile';
    const RemixStub = createRemixStub([
      { path, element: <UserProfileComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the success banner.
    expect(screen.getByRole('alert', { name: /success/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dismiss/i })).toHaveAttribute(
      'href',
      '/settings/profile',
    );
  });
});
