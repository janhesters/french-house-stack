import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createRemixStub, render, screen } from '~/test/test-utils';
import type { Factory } from '~/utils/types';

import type { UserAuthenticationComponentProps } from './user-authentication-component';
import { UserAuthenticationComponent } from './user-authentication-component';

const createProps: Factory<UserAuthenticationComponentProps> = ({
  email,
  emailError,
  formError,
  inputRef,
  state = 'idle',
} = {}) => ({ email, emailError, formError, inputRef, state });

describe('UserAuthentication component', () => {
  it('given an idle state and nothing else: renders the user authentication form', async () => {
    const user = userEvent.setup();
    const path = '/login';
    const props = createProps();
    const RemixStub = createRemixStub([
      { path, element: <UserAuthenticationComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the correct headings and a sub heading.
    expect(
      screen.getByRole('heading', { name: /sign in or sign up/i, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /sign in to your account/i,
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/or create an account/i, { selector: 'p' }),
    ).toBeInTheDocument();

    // It renders an empty email input.
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveValue('');

    // The user can type into it to change the value of the email.
    const email = faker.internet.email();
    await user.type(emailInput, email);
    expect(emailInput).toHaveValue(email);

    // It renders a submit button to log the user in.
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it('given an email: sets the email as the default value for the email input', () => {
    const email = faker.internet.email();
    const path = '/login';
    const props = createProps({ email });
    const RemixStub = createRemixStub([
      { path, element: <UserAuthenticationComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It passes the email to the email address input.
    expect(screen.getByLabelText(/email address/i)).toHaveValue(email);
  });

  it('given an email and an email error: displays the error for the email field', () => {
    const path = '/login';
    const email = faker.internet.email();
    const emailError = faker.lorem.sentence();
    const props = createProps({ email, emailError });
    const RemixStub = createRemixStub([
      { path, element: <UserAuthenticationComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It displays the email error.
    expect(
      screen.getByRole('textbox', { description: emailError }),
    ).toHaveValue(email);
    expect(screen.getByRole('alert')).toHaveTextContent(emailError);
    expect(
      screen.getByRole('textbox', { name: /email address/i }),
    ).not.toBeValid();
  });

  it('given a form error: displays the error for the form', () => {
    const path = '/login';
    const formError = faker.lorem.sentence();
    const props = createProps({ formError });
    const RemixStub = createRemixStub([
      { path, element: <UserAuthenticationComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It displays the form error.
    expect(screen.getByRole('alert')).toHaveTextContent(formError);
  });

  it('given a state of submitting: disables the email input and submit button', () => {
    const path = '/login';
    const props = createProps({ state: 'submitting' });
    const RemixStub = createRemixStub([
      { path, element: <UserAuthenticationComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);
    // It disables the email input and submit button.
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: /sign in/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /authenticating/i }),
    ).toBeDisabled();
  });
});
