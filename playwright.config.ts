import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:4201',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4201',
    url: 'http://127.0.0.1:4201',
    reuseExistingServer: !process.env['CI'],
  },
});
