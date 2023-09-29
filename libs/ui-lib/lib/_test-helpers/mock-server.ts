import { SetupServer } from 'msw/node';

let mockServer: SetupServer | null = null;

/**
 * Call this function if you intend to use a mock server.
 * @param value the value returned from calling `import('msw/node').setupServer(handlers)`
 * @see https://mswjs.io/docs/getting-started/mocks/rest-api
 * @example
 * import { setupServer, rest } from 'mws/node';
 *
 * beforeAll(() => {
 *   const handlers = []; // <-- Define `rest` handlers there
 *   setMockServer(setupServer(...handlers));
 *   getMockServer()?.listen({ onUnhandledRequest: 'error' });
 * });
 */
function setMockServer(value: SetupServer | null) {
  mockServer = value;
}

function getMockServer() {
  return mockServer;
}

export { setMockServer, getMockServer };
