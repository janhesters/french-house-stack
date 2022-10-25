import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./app/test/setup-test-environment.ts'],
    include: ['./**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    watchExclude: [
      '.*\\/node_modules\\/.*',
      '.*\\/build\\/.*',
      '.*\\/postgres-data\\/.*',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
