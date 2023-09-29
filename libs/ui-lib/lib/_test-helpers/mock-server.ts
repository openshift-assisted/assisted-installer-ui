import { SetupServer } from 'msw/node';

let mockServer: SetupServer | null = null;

function setMockServer(value: SetupServer | null) {
  mockServer = value;
}

function getMockServer() {
  return mockServer;
}

export { setMockServer, getMockServer };
