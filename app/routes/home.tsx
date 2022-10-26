import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import HomePageComponent from '~/features/home/home-page-component';
import i18next from '~/features/localization/i18next.server';
import { requireUserIsAuthenticated } from '~/features/user-authentication/user-authentication-session.server';

export const handle = { i18n: 'home' };

export const loader = async ({ request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const userId = await requireUserIsAuthenticated(request);
  // TODO: Store your users profile and grab it based on the `userId`.
  return json({
    title: `${t('home:home')} | ${t('app-name')}`,
    user: {
      name: 'Bob House',
      email: userId && 'bob@french-house-stack.com',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    navigation: [
      { name: t('home:dashboard'), href: '#', current: true },
      { name: t('home:team'), href: '#', current: false },
      { name: t('home:projects'), href: '#', current: false },
      { name: t('home:calendar'), href: '#', current: false },
      { name: t('home:reports'), href: '#', current: false },
    ],
    userNavigation: [
      { name: t('home:your-profile'), href: '#' },
      { name: t('home:settings'), href: '#' },
    ],
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: data?.title,
});

export default function HomePage() {
  const { navigation, user, userNavigation } = useLoaderData<typeof loader>();

  return (
    <HomePageComponent
      navigation={navigation}
      user={user}
      userNavigation={userNavigation}
    />
  );
}
