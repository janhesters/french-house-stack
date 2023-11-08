/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const remixConfig = {
  ignoredRouteFiles: ['**/.*', '*/*.test.ts', '*/*.test.tsx'],
  // See: https://remix.run/docs/en/main/guides/gotchas#importing-esm-packages
  serverDependenciesToBundle: [
    'remix-i18next', // https://github.com/sergiodxa/remix-i18next/issues/143#issuecomment-1749463869
    '@magic-sdk/admin',
    'msw',
    'path-to-regexp',
  ],
};

export default remixConfig;
