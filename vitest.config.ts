import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
      '.*\\/node_modules\\/.*',
      '.*\\/build\\/.*',
      '.*\\/postgres-data\\/.*',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    retry: process.env.CI ? 2 : 0,
  },
});
