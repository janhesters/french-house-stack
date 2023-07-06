/* eslint-disable unicorn/prefer-module */

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  future: {
    v2_routeConvention: true,
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_headers: true,
    v2_dev: true,
  },
  ignoredRouteFiles: ['**/.*', '*/*.test.ts', '*/*.test.tsx'],
  serverModuleFormat: 'cjs',
  tailwind: true,
};
