import { afterAll, afterEach, beforeEach, vi } from 'vitest';
import { initMockContainer, tryResetMockContainer } from './mock-container';
import { getMockServer } from './mock-server';

afterAll(() => {
  getMockServer()?.close();
});

beforeEach(() => {
  initMockContainer();
});

afterEach(() => {
  getMockServer()?.resetHandlers();
  tryResetMockContainer();
  vi.clearAllMocks();
});
