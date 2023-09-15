import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.classList.add('pf-u-h-100vh');
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement,
  );
}
