import fs from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import Backend from 'i18next-fs-backend';
import { RemixI18Next } from 'remix-i18next/server';

import { getRootDirectory } from '~/utils/get-root-directory';

import { i18n } from './i18n';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const localesDirectory = join(
  getRootDirectory(currentDirectory),
  'public',
  'locales',
  'en',
);

const ns: string[] = [];

fs.readdirSync(localesDirectory).forEach(file => {
  const nsName = basename(file, '.json');
  ns.push(nsName);
});

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
  },
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
    },
    ns,
  },
  plugins: [Backend],
});
