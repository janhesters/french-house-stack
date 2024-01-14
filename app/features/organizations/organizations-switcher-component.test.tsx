import { describe, expect, test } from 'vitest';

import {
  createRemixStub,
  render,
  screen,
  userEvent,
} from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import { createPopulatedOrganization } from './organizations-factories.server';
import type { OrganizationsSwitcherComponentProps } from './organizations-switcher-component';
import { OrganizationsSwitcherComponent } from './organizations-switcher-component';

const createProps: Factory<OrganizationsSwitcherComponentProps> = ({
  organizations = [
    {
      isCurrent: false,
      name: createPopulatedOrganization().name,
      slug: createPopulatedOrganization().slug,
    },
    {
      isCurrent: true,
      name: createPopulatedOrganization().name,
      slug: createPopulatedOrganization().slug,
    },
  ],
} = {}) => ({ organizations });

describe('OrganizationsSwitcher component', () => {
  test("given a list of the user's organizations: lets the user click on the current organization to expand the menu to show all and links to the page to create new organizations", async () => {
    const user = userEvent.setup();
    const props = createProps();
    const path = `/organizations/${props.organizations[1].slug}/home`;
    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <OrganizationsSwitcherComponent {...props} />,
      },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // Open the organization switcher menu.
    await user.click(
      screen.getByRole('combobox', { name: /select an organization/i }),
    );

    // Shows the other organizations and a link to create a new organization.
    props.organizations.forEach(organization => {
      expect(
        screen.getByRole('option', { name: organization.name }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: organization.name }),
      ).toHaveAttribute('href', `/organizations/${organization.slug}/home`);
    });
    expect(
      screen.getByRole('link', { name: /create organization/i }),
    ).toHaveAttribute('href', '/organizations/new');
  });
});
