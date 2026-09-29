import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  use: { viewport: { width: 1440, height: 900 } },
  webServer: {
    command: 'npx http-server demo-board -p 5174 -c-1 --silent',
    url: 'http://localhost:5174/',
    reuseExistingServer: true,
  },
});
