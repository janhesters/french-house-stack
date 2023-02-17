import type { LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { pick } from 'ramda';

import { HomePageComponent } from '~/features/home/home-page-component';
import { i18next } from '~/features/localization/i18next.server';
import { requireUserIsAuthenticated } from '~/features/user-authentication/user-authentication-session.server';
import { requireUserProfileExists } from '~/features/user-profile/user-profile-helpers.server';
import { getPageTitle } from '~/utils/get-page-title.server';

export const handle = { i18n: 'home' };

export const loader = async ({ request }: LoaderArgs) => {
  const [t, userId] = await Promise.all([
    i18next.getFixedT(request),
    requireUserIsAuthenticated(request),
  ]);
  const userProfile = await requireUserProfileExists(userId);

  return json({
    title: await getPageTitle(request, t('home:home') ?? undefined),
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

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.title },
];

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
