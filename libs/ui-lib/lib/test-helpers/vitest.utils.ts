import { SetupServer } from 'msw/node';
import { unmountComponentAtNode } from 'react-dom';

let mockServer: SetupServer | null = null;
let mockContainer: HTMLDivElement | null = null;

function setMockServer(value: SetupServer | null) {
  mockServer = value;
}

function initMockContainer(value: HTMLDivElement | null) {
  mockContainer = value;
  if (mockContainer) {
    mockContainer.id = 'root';
    document.body.appendChild(mockContainer);
  }
}

function resetMockContainer() {
  if (mockContainer) {
    unmountComponentAtNode(mockContainer);
    mockContainer.remove();
    mockContainer = null;
  }
}

export { mockContainer, initMockContainer, resetMockContainer, mockServer, setMockServer };
