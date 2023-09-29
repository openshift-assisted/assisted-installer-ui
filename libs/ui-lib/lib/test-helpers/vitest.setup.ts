import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { mockServer, initMockContainer, resetMockContainer } from './vitest.utils';

beforeAll(() => {
  mockServer?.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  mockServer?.close();
});

beforeEach(() => {
  initMockContainer(document.createElement('div'));
});

afterEach(() => {
  mockServer?.resetHandlers();
  resetMockContainer();
  vi.clearAllMocks();
});
