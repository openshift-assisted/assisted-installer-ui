import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { initMockContainer, resetMockContainer } from './mock-container';
import { getMockServer } from './mock-server';

beforeAll(() => {
  getMockServer()?.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  getMockServer()?.close();
});

beforeEach(() => {
  initMockContainer(document.createElement('div'));
});

afterEach(() => {
  getMockServer()?.resetHandlers();
  resetMockContainer();
  vi.clearAllMocks();
});
