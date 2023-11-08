import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import {
  CalendarIcon,
  FolderIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { describe, expect, test } from 'vitest';

import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import { getNameAbbreviation } from '~/features/user-profile/user-profile-helpers.server';
import {
  createRemixStub,
  render,
  screen,
  userEvent,
} from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import type {
  NavigationItemWithChildrenProps,
  SidebarProps,
  SingleNavigationItem,
} from './sidebar';
import { Sidebar } from './sidebar';

const createProps: Factory<SidebarProps> = ({
  headerTitle,
  navigation = [
    {
      id: createId(),
      items: [
        { name: 'Playground', href: '/playground', icon: HomeIcon },
        {
          name: 'Teams',
          icon: UserIcon,
          children: [
            { name: 'Engineering', href: '/engineering' },
            { name: 'Human Resources', href: '/human-resources' },
            { name: 'Customer Success', href: '/customer-success' },
          ],
        },
      ],
    },
    {
      id: 'archive',
      name: 'Archive',
      items: [
        {
          name: 'Projects',
          icon: FolderIcon,
          children: [
            { name: 'GraphQL API', href: '/graphql-api' },
            { name: 'iOS App', href: '/ios-app' },
            { name: 'Android App', href: '/android-app' },
            { name: 'New Customer Portal', href: '/new-customer-portal' },
          ],
        },
        { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
      ],
    },
    {
      id: 'other',
      items: [
        {
          name: 'Settings',
          icon: SettingsIcon,
          href: '/settings',
        },
      ],
    },
  ],
  notifications,
  renderBackButton = faker.datatype.boolean(),
  renderSearchBar = faker.datatype.boolean(),
  sidebarTitle = faker.company.name(),
  userNavigation = {
    avatar: faker.internet.avatar(),
    abbreviation: getNameAbbreviation(faker.person.fullName()),
    email: faker.internet.email(),
    items: [
      { name: 'Your profile', href: '/profile' },
      { name: 'Settings', href: '/settings' },
    ],
    name: faker.person.fullName(),
  },
} = {}) => ({
  headerTitle,
  navigation,
  notifications,
  renderBackButton,
  renderSearchBar,
  sidebarTitle,
  userNavigation,
});

describe('Sidebar component', () => {
  test('given no notifications and an array of navigation groups, some with names, some without, and some items have children: renders the items correctly', async () => {
    const user = userEvent.setup();
    const props = createProps();
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders a link for each route without children.
    const childlessRoutes = props.navigation.flatMap(group =>
      // @ts-expect-error We know that some items lack a children property.
      group.items.filter(item => !item.children),
    ) as SingleNavigationItem[];
    childlessRoutes.forEach(({ name, href }) => {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
    });

    // It renders a link for each child route after clicking to expand them.
    const routesWithChildren = props.navigation.flatMap(group =>
      // @ts-expect-error We know that some items have a children property.
      group.items.filter(item => item.children),
    ) as NavigationItemWithChildrenProps[];
    for (const { name, children } of routesWithChildren) {
      await user.click(screen.getByRole('button', { name }));
      children.forEach(({ name, href }) => {
        const link = screen.getByRole('link', { name });
        expect(link).toHaveAttribute('href', href);
      });
    }

    // It does NOT render a notification count.
    expect(screen.queryByText(/notifications/i)).not.toBeInTheDocument();
  });

  test('given a notification count of 0: renders a button to view the notifications', () => {
    const props = createProps({ notifications: 0 });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders a button to view the notifications.
    expect(
      screen.getByRole('button', { name: /view notifications/i }),
    ).toBeInTheDocument();
  });

  test('given a notification count that is greater than 0: renders a button to view the notifications and the notification count', () => {
    const props = createProps({
      notifications: faker.number.int({ min: 1 }),
    });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders a button to view the notifications.
    expect(
      screen.getByRole('button', {
        name: new RegExp(`view ${props.notifications} new notifications`, 'i'),
      }),
    ).toBeInTheDocument();
  });

  test('given a child route: renders the child route via an Outlet', () => {
    const testId = createId();
    const props = createProps();
    const { slug } = createPopulatedOrganization();
    const basePath = `/organizations/${slug}`;
    const path = `${basePath}/playground`;
    const RemixStub = createRemixStub([
      {
        path: basePath,
        Component: () => <Sidebar {...props} />,
        children: [{ path, Component: () => <div data-testid={testId} /> }],
      },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the Outlet.
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  test('given renderSearchBar prop as false: does not render the search bar', () => {
    const props = createProps({ renderSearchBar: false });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It does not render the search bar.
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  test('given renderSearchBar prop as true: renders the search bar', () => {
    const props = createProps({ renderSearchBar: true });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <Sidebar {...props} />,
      },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the search bar.
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  test('given renderBackButton prop as false: does not render a back button', () => {
    const props = createProps({ renderBackButton: false });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It does not render a back button.
    expect(
      screen.queryByRole('button', { name: /go back/i }),
    ).not.toBeInTheDocument();
  });

  test('given renderBackButton prop as true: renders a back button', () => {
    const props = createProps({ renderBackButton: true });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <Sidebar {...props} />,
      },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders a back button.
    expect(
      screen.getByRole('button', { name: /go back/i }),
    ).toBeInTheDocument();
  });

  test("given a user name, an avatar and user navigation items: renders the user's avatar and clicking on it opens the user navigation", async () => {
    const user = userEvent.setup();
    const props = createProps();
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders a button to open the user menu.
    await user.click(screen.getByRole('button', { name: /open user menu/i }));
    expect(screen.getByText(props.userNavigation.name)).toBeInTheDocument();
    expect(screen.getByText(props.userNavigation.email)).toBeInTheDocument();
    props.userNavigation.items.forEach(({ name }) => {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    });
    expect(
      screen.getByRole('menuitem', { name: /log out/i }),
    ).toBeInTheDocument();
  });

  test('given a header title: renders the header title', () => {
    const headerTitle = faker.lorem.words();
    const props = createProps({ headerTitle });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the header title.
    expect(
      screen.getByRole('heading', { name: headerTitle, level: 1 }),
    ).toBeInTheDocument();
  });

  test('given a sidebar title that is a string: renders that sidebar title', () => {
    const sidebarTitle = faker.company.name();
    const props = createProps({ sidebarTitle });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the side bar title.
    expect(
      screen.getByText(sidebarTitle, { exact: false }),
    ).toBeInTheDocument();
  });

  test('given a sidebar title that is a React element: renders that sidebar title', () => {
    const testId = createId();
    const sidebarTitle = <div data-testid={testId}>{faker.company.name()}</div>;
    const props = createProps({ sidebarTitle });
    const { slug } = createPopulatedOrganization();
    const path = `/organizations/${slug}`;
    const RemixStub = createRemixStub([
      { path, Component: () => <Sidebar {...props} /> },
    ]);

    render(<RemixStub initialEntries={[path]} />);

    // It renders the side bar title react element.
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
