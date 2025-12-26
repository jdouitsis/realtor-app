import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from "path";
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const __dirname = typeof globalThis.__dirname !== 'undefined'
  ? globalThis.__dirname
  : path.dirname(fileURLToPath(import.meta.url));

// https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [{
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(__dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }]
    }
  })
);
