import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { pick } from 'ramda';

import HomePageComponent from '~/features/home/home-page-component';
import i18next from '~/features/localization/i18next.server';
import { requireUserIsAuthenticated } from '~/features/user-authentication/user-authentication-session.server';
import { requireUserProfileExists } from '~/features/user-profile/user-profile-helpers.server';

export const handle = { i18n: 'home' };

export const loader = async ({ request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const userId = await requireUserIsAuthenticated(request);
  const userProfile = await requireUserProfileExists(userId);
  // TODO: Store your users profile and grab it based on the `userId`.
  return json({
    title: `${t('home:home')} | ${t('app-name')}`,
    userProfile: pick(['avatar', 'email', 'name'], userProfile),
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
  const { navigation, userProfile, userNavigation } =
    useLoaderData<typeof loader>();

  return (
    <HomePageComponent
      navigation={navigation}
      userProfile={userProfile}
      userNavigation={userNavigation}
    />
  );
}
