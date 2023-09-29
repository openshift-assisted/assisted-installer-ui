import { unmountComponentAtNode } from 'react-dom';

let element: HTMLDivElement | null = null;

function getMockContainer() {
  return element;
}

/**
 * Call this in your test if you intend to render a React component
 * @example
 * beforeEach(() => {
 *    initMockContainer();
 * });
 */
function initMockContainer(
  value: HTMLDivElement = document.createElement('div'),
  baseElement: HTMLElement = document.body,
) {
  element = value;
  element.id = 'root';
  baseElement.appendChild(element);
}

/**
 * Attempts to unmount and remove the underlying DOM element.
 *
 * Returns true when the underlying DOM element is reset successfully; false otherwise.
 */
function tryResetMockContainer() {
  let didResetMockContainer = false;
  if (element) {
    unmountComponentAtNode(element);
    element.remove();
    element = null;
    didResetMockContainer = true;
  }

  return didResetMockContainer;
}

export { getMockContainer, initMockContainer, tryResetMockContainer };
