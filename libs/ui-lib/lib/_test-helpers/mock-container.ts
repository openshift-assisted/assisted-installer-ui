import ReactDOM from 'react-dom/client';

let element: HTMLDivElement | null = null;
let root: ReactDOM.Root;

function getMockContainer() {
  if (element) {
    root = ReactDOM.createRoot(element);
    return root;
  }
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
  if (element && root) {
    root.unmount();
    element.remove();
    element = null;
    didResetMockContainer = true;
  }

  return didResetMockContainer;
}

export { getMockContainer, initMockContainer, tryResetMockContainer };
