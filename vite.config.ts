import { vitePlugin as remix } from '@remix-run/dev';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild }) => ({
  build: isSsrBuild ? { target: 'ES2022' } : {},
  plugins: [
    process.env.VITEST
      ? react()
      : remix({
          ignoredRouteFiles: ['**/.*', '*/*.test.ts', '*/*.test.tsx'],
          future: {
            v3_fetcherPersist: true,
            v3_relativeSplatPath: true,
            v3_throwAbortReason: true,
            unstable_singleFetch: true,
            unstable_optimizeDeps: true,
            unstable_lazyRouteDiscovery: true,
          },
        }),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
  },
  ssr: {
    // See: https://remix.run/docs/en/main/guides/gotchas#importing-esm-packages
    // See: https://remix.run/docs/en/main/future/vite#esm--cjs
    noExternal: ['@magic-sdk/admin', 'msw', 'path-to-regexp'],
  },
  test: {
    environment: 'happy-dom',
    environmentMatchGlobs: [
      ['**/*.server.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'node'],
      ['app/routes/**/*.test.ts', 'node'],
    ],
    globals: true,
    setupFiles: ['./app/test/setup-test-environment.ts'],
    include: ['./app/**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    watchExclude: [
      String.raw`.*\/node_modules\/.*`,
      String.raw`.*\/build\/.*`,
      String.raw`.*\/postgres-data\/.*`,
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    retry: process.env.CI ? 5 : 0,
  },
}));
