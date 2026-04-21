import '@testing-library/jest-dom/vitest';
import { mockGoogleGIS, seedLocalStorage, clearLocalStorage } from './helpers';
import { resetMockData } from './mocks/handlers';
import { worker } from './worker';

beforeAll(async () => {
  await worker.start({
    onUnhandledRequest: 'warn',
    quiet: true,
  });
});

beforeEach(() => {
  worker.resetHandlers();
  resetMockData();
  clearLocalStorage();
  mockGoogleGIS();
  seedLocalStorage();
});

afterAll(() => {
  worker.stop();
});

export { worker };
