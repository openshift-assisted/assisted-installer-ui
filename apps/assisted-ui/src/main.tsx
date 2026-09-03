import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.classList.add('pf-v6-u-h-100vh');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
