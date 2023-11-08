import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { GithubIcon } from 'lucide-react';
import { Trans } from 'react-i18next';

import { Code, Text, TextLink } from '~/components/text';
import { buttonVariants } from '~/components/ui/button';
import { TypographyH1 } from '~/components/ui/typography';
import { useTranslation } from '~/features/localization/use-translation';
import { requireAnonymous } from '~/features/user-authentication/user-authentication-helpers.server';

import tenXDevelopmentAvatar from '../../public/avatar.png';
import magicLogo from '../../public/magic-icon.png';

export const handle = { i18n: ['common', 'landing'] };

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request);
  return json({});
}

const logos = [
  {
    src: 'https://user-images.githubusercontent.com/1500684/157773063-20a0ed64-b9f8-4e0b-9d1e-0b65a3d4a6db.svg',
    alt: 'TypeScript',
    href: 'https://typescriptlang.org',
  },
  {
    src: magicLogo,
    alt: 'Magic',
    href: 'https://magic.link',
  },
  {
    src: 'https://user-images.githubusercontent.com/1500684/157772447-00fccdce-9d12-46a3-8bb4-fac612cdc949.svg',
    alt: 'Vitest',
    href: 'https://vitest.dev',
  },
  {
    src: 'https://raw.githubusercontent.com/github/explore/60cd2530141f67f07a947fa2d310c482e287e387/topics/playwright/playwright.png',
    alt: 'Playwright',
    href: 'https://playwright.dev/',
  },
  {
    src: 'https://user-images.githubusercontent.com/1500684/157764276-a516a239-e377-4a20-b44a-0ac7b65c8c14.svg',
    alt: 'Tailwind',
    href: 'https://tailwindcss.com',
  },
  {
    src: 'https://user-images.githubusercontent.com/1500684/157764397-ccd8ea10-b8aa-4772-a99b-35de937319e1.svg',
    alt: 'Fly.io',
    href: 'https://fly.io',
  },
  {
    src: 'https://user-images.githubusercontent.com/1500684/157764395-137ec949-382c-43bd-a3c0-0cb8cb22e22d.svg',
    alt: 'SQLite',
    href: 'https://sqlite.org',
  },
  {
    src: 'https://user-images.githubusercontent.com/1500684/157764484-ad64a21a-d7fb-47e3-8669-ec046da20c1f.svg',
    alt: 'Prisma',
    href: 'https://prisma.io',
  },
  {
    src: 'https://user-images.githubusercontent.com/1500684/157772386-75444196-0604-4340-af28-53b236faa182.svg',
    alt: 'MSW',
    href: 'https://mswjs.io',
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
];

export default function Landing() {
  const { t } = useTranslation('landing');

  return (
    <main className="container mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-12 py-4 lg:gap-16">
      <div className="relative py-4">
        <div className="absolute inset-0">
          <img
            className="h-full w-full rounded-lg border border-foreground object-cover shadow-xl sm:rounded-2xl"
            src="https://images.unsplash.com/photo-1530352865347-3c2e277abefe"
            alt={t('dj-image-alt')}
          />
          <div className="absolute inset-0 rounded-l bg-primary opacity-50 mix-blend-multiply sm:rounded-2xl" />
        </div>

        <div className="relative flex flex-col items-center gap-4 text-center">
          <a
            className={buttonVariants({ variant: 'secondary' })}
            href="https://twitter.com/tenxdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Ten X Dev"
              src={tenXDevelopmentAvatar}
              className="mr-2 size-4"
            />
            {t('follow-ten-x-dev')}
          </a>

          <TypographyH1 className="text-primary">
            {t('common:app-name')}
          </TypographyH1>

          <Text className="mt-0 text-balance text-xl text-white">
            <Trans
              components={{
                1: (
                  <TextLink
                    className="text-muted-foreground/80 hover:text-primary"
                    to="https://github.com/ten-x-dev/french-house-stack/blob/main/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                2: <Code />,
              }}
              i18nKey="landing:stack-instructions"
            />
          </Text>

          <div className="flex items-center gap-x-4">
            <Link className={buttonVariants()} to="/register">
              {t('register')}
            </Link>

            <a
              className={buttonVariants({ variant: 'outline' })}
              href="https://github.com/ten-x-dev/french-house-stack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="mr-2 size-4" />
              GitHub
            </a>
          </div>

          <a
            className="rounded-md px-4 py-2 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            href="https://remix.run"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Remix"
              src="https://user-images.githubusercontent.com/1500684/158298926-e45dafff-3544-4b69-96d6-d3bcc33fc76a.svg"
              className="mx-auto w-full max-w-48 md:max-w-64"
            />
          </a>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {logos.map(img => (
          <li key={img.href}>
            <a
              className="mx-auto flex h-16 w-32 justify-center rounded-md grayscale transition hover:grayscale-0 focus:grayscale-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-40"
              href={img.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img alt={img.alt} src={img.src} />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
