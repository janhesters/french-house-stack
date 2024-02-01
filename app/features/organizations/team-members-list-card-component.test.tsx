import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import {
  createRemixStub,
  render,
  screen,
  userEvent,
  within,
} from '~/test/react-test-utils';
import { asyncForEach } from '~/utils/async-for-each.server';
import type { Factory } from '~/utils/types';

import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import { createPopulatedOrganization } from './organizations-factories.server';
import type {
  TeamMember,
  TeamMembersListCardComponentProps,
} from './team-members-list-card-component';
import { TeamMembersListCardComponent } from './team-members-list-card-component';

const createMember: Factory<TeamMember> = ({
  email = createPopulatedUserProfile().email,
  id = createPopulatedUserProfile().id,
  name = createPopulatedUserProfile().name,
  role = faker.helpers.arrayElement(
    Object.values(ORGANIZATION_MEMBERSHIP_ROLES),
  ),
  deactivatedAt = faker.datatype.boolean() ? faker.date.recent() : null,
} = {}) => ({ email, id, name, role, deactivatedAt });

const createProps: Factory<TeamMembersListCardComponentProps> = ({
  currentPage = faker.number.int({ min: 1, max: 3 }),
  currentUsersId = createPopulatedUserProfile().id,
  currentUserIsOwner = faker.datatype.boolean(),
  teamMembers = faker.helpers
    .uniqueArray(
      () => createPopulatedUserProfile().email,
      faker.number.int({ min: 1, max: 10 }),
    )
    .map(email => createMember({ email })),
  totalItemCount = teamMembers.length,
  ...props
} = {}) => ({
  currentPage,
  currentUserIsOwner,
  currentUsersId,
  teamMembers,
  totalItemCount,
  ...props,
});

describe('TeamMembersListCard component', () => {
  test('given the user is on a middle page: renders the pagination component correctly', () => {
    const props = createProps({ currentPage: 2, totalItemCount: 21 });
    const { slug } = createPopulatedOrganization();
    const path = `/organization/${slug}/team-members`;
    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <TeamMembersListCardComponent {...props} />,
      },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the correct pagination links.
    expect(screen.queryByRole('link', { name: /previous/i })).toHaveAttribute(
      'href',
      `${path}?page=1`,
    );
    expect(screen.queryByRole('link', { name: /next/i })).toHaveAttribute(
      'href',
      `${path}?page=3`,
    );
  });

  describe('given the current user is NOT an owner', () => {
    const currentUserIsOwner = false;

    test('given an array of team members: renders the team members and their roles are NOT editable', () => {
      const { slug } = createPopulatedOrganization();
      const path = `/organizations/${slug}/settings/team-members`;
      const props = createProps({ currentUserIsOwner });
      const RemixStub = createRemixStub([
        {
          path,
          Component: () => <TeamMembersListCardComponent {...props} />,
        },
      ]);

      render(<RemixStub initialEntries={[path]} />);

      // It renders the team members.
      expect(
        screen.getByRole('list', { name: /team members/i }),
      ).toBeInTheDocument();
      props.teamMembers.forEach(member => {
        const listItem = screen.getByText(member.name).closest('li')!;
        expect(within(listItem).getByText(member.email)).toBeInTheDocument();
        const role = member.deactivatedAt ? 'deactivated' : member.role;
        expect(
          within(listItem).getByText(role, { exact: false }),
        ).toBeInTheDocument();
        // It does NOT render the dropdown to change the role.
        expect(within(listItem).queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });

  describe('given the current user is an owner', () => {
    const currentUserIsOwner = true;

    test('given an array of team members: renders the team members', async () => {
      const user = userEvent.setup();
      const { slug } = createPopulatedOrganization();
      const path = `/organizations/${slug}/settings/team-members`;
      const props = createProps({ currentUserIsOwner });
      const RemixStub = createRemixStub([
        {
          path,
          Component: () => <TeamMembersListCardComponent {...props} />,
        },
      ]);

      render(<RemixStub initialEntries={[path]} />);

      // It renders the team members.
      expect(
        screen.getByRole('list', { name: /team members/i }),
      ).toBeInTheDocument();
      await asyncForEach(props.teamMembers, async member => {
        const listItem = screen.getByText(member.name).closest('li')!;
        expect(within(listItem).getByText(member.email)).toBeInTheDocument();
        await user.click(
          within(listItem).getByRole('button', {
            name: new RegExp(
              member.deactivatedAt ? 'deactivated' : member.role,
              'i',
            ),
          }),
        );
      });
    });

    test('given the user sees themselves in the list: can NOT change the role of themselves', async () => {
      const user = userEvent.setup();
      const { slug } = createPopulatedOrganization();
      const path = `/organizations/${slug}/settings/team-members`;
      const { teamMembers } = createProps({ currentUserIsOwner });
      const [currentUser] = teamMembers;
      const props = createProps({
        currentUserIsOwner,
        currentUsersId: currentUser.id,
        teamMembers,
      });
      const RemixStub = createRemixStub([
        {
          path,
          Component: () => <TeamMembersListCardComponent {...props} />,
        },
      ]);

      render(<RemixStub initialEntries={[path]} />);

      // For the current user, the dropdown is NOT rendered.
      const listItem = screen.getByText(currentUser.name).closest('li')!;
      expect(within(listItem).getByText(currentUser.email)).toBeInTheDocument();
      const role = currentUser.deactivatedAt ? 'deactivated' : currentUser.role;
      expect(
        within(listItem).getByText(role, { exact: false }),
      ).toBeInTheDocument();
      // It does NOT render the dropdown to change the role.
      expect(within(listItem).queryByRole('button')).not.toBeInTheDocument();

      // Check for the other users that the dropdown is rendered.
      await asyncForEach(
        props.teamMembers.slice(1, teamMembers.length),
        async member => {
          const listItem = screen.getByText(member.name).closest('li')!;
          expect(within(listItem).getByText(member.email)).toBeInTheDocument();
          await user.click(
            within(listItem).getByRole('button', {
              name: new RegExp(
                member.deactivatedAt ? 'deactivated' : member.role,
                'i',
              ),
            }),
          );
        },
      );
    });
  });
});
