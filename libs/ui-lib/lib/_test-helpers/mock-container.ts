import { unmountComponentAtNode } from 'react-dom';

let element: HTMLDivElement | null = null;

function getMockContainer() {
  return element;
}

function initMockContainer(value: HTMLDivElement | null) {
  element = value;
  if (element) {
    element.id = 'root';
    document.body.appendChild(element);
  }
}

function resetMockContainer() {
  if (element) {
    unmountComponentAtNode(element);
    element.remove();
    element = null;
  }
}

export { getMockContainer, initMockContainer, resetMockContainer };
