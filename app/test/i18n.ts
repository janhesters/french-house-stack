import fs from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getRootDirectory } from '~/utils/get-root-directory';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const localesDirectory = join(
  getRootDirectory(currentDirectory),
  'public',
  'locales',
  'en',
);

const ns: string[] = [];
const resources: { [K: string]: string } = {};

fs.readdirSync(localesDirectory).forEach(file => {
  const nsName = basename(file, '.json');
  // eslint-disable-next-line unicorn/prefer-module
  const nsData = require(join(localesDirectory, file));

  ns.push(nsName);
  resources[nsName] = nsData;
});

i18next.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  ns,
  resources: {
    en: resources,
  },
});

// eslint-disable-next-line unicorn/prefer-export-from
export default i18next;
