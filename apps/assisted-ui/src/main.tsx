import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';

declare global {
  interface Window {
    OCM_REFRESH_TOKEN?: string;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.classList.add('pf-v5-u-h-100vh');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
