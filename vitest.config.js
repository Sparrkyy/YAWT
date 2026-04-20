import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./src/test/setup.js'],
          include: ['src/__tests__/**/*.test.{js,jsx}'],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'browser',
          globals: true,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./e2e/setup.js'],
          include: ['e2e/**/*.test.{js,jsx}'],
        },
      },
    ],
  },
});
