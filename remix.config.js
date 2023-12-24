/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const remixConfig = {
  ignoredRouteFiles: ['**/.*', '*/*.test.ts', '*/*.test.tsx'],
  serverDependenciesToBundle: ['remix-i18next'],
};

export default remixConfig;
