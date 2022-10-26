/**
 * .blur() is broken right now, so we need to use jsdom instead of happy-dom.
 * @vitest-environment jsdom
 */

import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { act, render, screen } from '~/test/test-utils';
import type { Factory } from '~/utils/types';

import type { UserAuthenticationComponentProps } from './user-authentication-component';
import UserAuthentication from './user-authentication-component';

const createProps: Factory<UserAuthenticationComponentProps> = ({
  failedToLoadMagic = false,
  handleSubmit = () => {},
  isOffline = false,
} = {}) => ({
  children: <p data-testid="children">Child</p>,
  failedToLoadMagic,
  handleSubmit,
  isOffline,
});

describe('UserAuthentication component', () => {
  it('given no errors, a handleSubmit function and some children: it renders the children, renders a heading, handles malformed email errors and calls the submit function when the user clicked "log in"', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const props = createProps({ handleSubmit });

    render(<UserAuthentication {...props} />);

    // It renders a heading.
    expect(
      screen.getByRole('heading', { name: /sign in or sign up/i, level: 1 }),
    ).toBeInTheDocument();

    // It renders the children
    expect(screen.getByTestId('children')).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: /sign in/i });

    // The submit button is disabled by default
    expect(loginButton).toBeDisabled();

    // Typing nothing into the input notifies the user that an email is required
    const input = screen.getByLabelText(/email/i);
    input.focus();
    act(() => {
      input.blur();
    });
    expect(
      await screen.findByRole('textbox', {
        description: /email \(required\)/i,
      }),
    ).toBeInTheDocument();

    // Typing in an invalid email keeps the login button disabled and ...
    await user.type(input, 'some@email');
    act(() => {
      input.blur();
    });
    expect(loginButton).toBeDisabled();
    // ... shows an error message about what went wrong
    expect(
      screen.getByRole('textbox', {
        description: /a valid email consists of/i,
      }),
    ).toBeInTheDocument();

    // Typing in a valid email enables the button
    const email = 'some@email.com';
    await user.clear(input);
    await user.type(input, email);
    expect(loginButton).toBeEnabled();

    // Clicking the button should cal the handleSubmit function.
    await user.click(loginButton);
    expect(handleSubmit).toHaveBeenCalledWith({ email }, expect.any(Object));
  });

  it('given Magic provider failed to load: it renders an error and disables the UI', async () => {
    const props = createProps({ failedToLoadMagic: true });

    render(<UserAuthentication {...props} />);

    // It renders the appropriate error to the user.
    expect(
      screen.getByRole('textbox', {
        description: /failed to load authentication provider/i,
      }),
    ).toBeInTheDocument();

    // It disables the sign in button.
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('given the user is offline: it renders an error and disables the UI', () => {
    const props = createProps({ isOffline: true });

    render(<UserAuthentication {...props} />);

    // It renders the appropriate error to the user.
    expect(
      screen.getByRole('textbox', {
        description: /please connect to the internet/i,
      }),
    ).toBeInTheDocument();

    // It disables the sign in button.
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });
});
