import '@testing-library/jest-dom/vitest';
import { setupWorker } from 'msw/browser';
import { handlers, resetMockData } from './mocks/handlers';
import { mockGoogleGIS, seedLocalStorage, clearLocalStorage } from './helpers';

const worker = setupWorker(...handlers);

beforeAll(async () => {
  await worker.start({
    onUnhandledRequest: 'warn',
    quiet: true,
  });
});

beforeEach(() => {
  resetMockData();
  clearLocalStorage();
  mockGoogleGIS();
  seedLocalStorage();
});

afterAll(() => {
  worker.stop();
});
