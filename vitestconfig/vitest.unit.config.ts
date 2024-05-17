import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from '../vite.config';

export default defineConfig(configEnv =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        include: ['./app/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      },
    }),
  ),
);
