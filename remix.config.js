/* eslint-disable unicorn/prefer-module */
/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/*.test.{ts,tsx}'],
  future: {
    // broken, see: https://github.com/remix-run/remix/issues/5322
    v2_routeConvention: true,
    v2_meta: true,
    v2_errorBoundary: true,
    unstable_tailwind: true,
  },
};
