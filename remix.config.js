/* eslint-disable unicorn/prefer-module */
const { flatRoutes } = require('remix-flat-routes');

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/*'],
  routes: defineRoutes =>
    flatRoutes('routes', defineRoutes, {
      ignoredRouteFiles: ['**/*.test.{ts,tsx}'],
    }),
  future: {
    // broken, see: https://github.com/remix-run/remix/issues/5322
    // v2_routeConvention: true,
    v2_meta: true,
    v2_errorBoundary: true,
  },
};
