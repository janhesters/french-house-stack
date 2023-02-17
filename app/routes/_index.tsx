import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { getUserId } from '~/features/user-authentication/user-authentication-session.server';
import { getSafeRedirectDestination } from '~/utils/get-safe-redirect-destination.server';

import magicLogo from '../../public/magic-icon.png';

export const handle = { i18n: ['common', 'landing'] };

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);

  if (userId) {
    const redirectTo = getSafeRedirectDestination(request, '/home');
    return redirect(redirectTo);
  }

  return json({});
};

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-800 sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1530352865347-3c2e277abefe"
                alt="A DJ by https://unsplash.com/@emilianovittoriosi"
              />
              <div className="absolute inset-0 bg-[color:rgba(79,70,229,0.5)] mix-blend-multiply" />
            </div>
            <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-indigo-600 drop-shadow-md">
                  {t('app-name')}
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                {t('landing:stack-instructions')}
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-600  "
                >
                  {t('landing:sign-in')}
                </Link>
              </div>
              <a href="https://remix.run">
                <img
                  alt={t('landing:remix') || undefined}
                  src="https://user-images.githubusercontent.com/1500684/158298926-e45dafff-3544-4b69-96d6-d3bcc33fc76a.svg"
                  className="mx-auto mt-16 w-full max-w-[12rem] md:max-w-[16rem]"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex flex-wrap justify-center gap-8">
            {[
              {
                src: magicLogo,
                alt: 'Magic',
                href: 'https://magic.link',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157764276-a516a239-e377-4a20-b44a-0ac7b65c8c14.svg',
                alt: 'Tailwind',
                href: 'https://tailwindcss.com',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157764454-48ac8c71-a2a9-4b5e-b19c-edef8b8953d6.svg',
                alt: 'Playwright',
                href: 'https://www.playwright.dev',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157772386-75444196-0604-4340-af28-53b236faa182.svg',
                alt: 'MSW',
                href: 'https://mswjs.io',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157772447-00fccdce-9d12-46a3-8bb4-fac612cdc949.svg',
                alt: 'Vitest',
                href: 'https://vitest.dev',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157772662-92b0dd3a-453f-4d18-b8be-9fa6efde52cf.png',
                alt: 'Testing Library',
                href: 'https://testing-library.com',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157772934-ce0a943d-e9d0-40f8-97f3-f464c0811643.svg',
                alt: 'Prettier',
                href: 'https://prettier.io',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157772990-3968ff7c-b551-4c55-a25c-046a32709a8e.svg',
                alt: 'ESLint',
                href: 'https://eslint.org',
              },
              {
                src: 'https://user-images.githubusercontent.com/1500684/157773063-20a0ed64-b9f8-4e0b-9d1e-0b65a3d4a6db.svg',
                alt: 'TypeScript',
                href: 'https://typescriptlang.org',
              },
            ].map(img => (
              <a
                key={img.href}
                href={img.href}
                className="flex h-16 w-32 justify-center p-1 grayscale transition hover:grayscale-0 focus:grayscale-0"
              >
                <img alt={img.alt} src={img.src} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
