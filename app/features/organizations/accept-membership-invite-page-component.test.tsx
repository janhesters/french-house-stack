import { describe, expect, test } from 'vitest';

import { createRemixStub, render, screen } from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.server';
import type { AcceptMembershipInvitePageComponentProps } from './accept-membership-invite-page-component';
import { AcceptMembershipInvitePageComponent } from './accept-membership-invite-page-component';
import { createPopulatedOrganization } from './organizations-factories.server';

const createProps: Factory<AcceptMembershipInvitePageComponentProps> = ({
  inviterName = createPopulatedUserProfile().name,
  organizationName = createPopulatedOrganization().name,
  ...props
} = {}) => ({ inviterName, organizationName, ...props });

describe('AcceptMembershipInvitePage component', () => {
  test('given an organization name and an inviter name: renders a greeting and a button to accept the invite', () => {
    const props = createProps();
    const path = `/organizations/invite`;
    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <AcceptMembershipInvitePageComponent {...props} />,
      },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders a greeting.
    expect(
      screen.getByText(/welcome to french house stack/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(
          `${props.inviterName} invites you to join ${props.organizationName}`,
          'i',
        ),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /click the button below to sign up. by using this link you will automatically join the correct organization./i,
      ),
    ).toBeInTheDocument();

    // It renders a button to accept the invite.
    expect(
      screen.getByRole('button', { name: /accept invite/i }),
    ).toHaveAttribute('type', 'submit');
  });
});
