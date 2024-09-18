import { describe, expect, test } from 'vitest';

import { createRemixStub, render, screen } from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import type { ContactSalesTeamComponentProps } from './contact-sales-team-component';
import { ContactSalesTeamComponent } from './contact-sales-team-component';

const createProps: Factory<ContactSalesTeamComponentProps> = ({
  ...props
} = {}) => ({
  ...props,
});

describe('ContactSalesTeam component', () => {
  test('given no props: renders inputs for the first and last name, the company name, the work email, the phone number, and a message, as well as a submit button', () => {
    const path = '/contact-sales';
    const props = createProps();
    const RemixStub = createRemixStub([
      { path, Component: () => <ContactSalesTeamComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  test('given no props: renders a honeypot input', () => {
    const path = '/contact-sales';
    const props = createProps();
    const RemixStub = createRemixStub([
      { path, Component: () => <ContactSalesTeamComponent {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    expect(
      screen.getByLabelText(/please leave this field blank/i),
    ).toBeInTheDocument();
  });
});
