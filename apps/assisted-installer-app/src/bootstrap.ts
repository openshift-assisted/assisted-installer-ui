import React from 'react';
import { createRoot } from 'react-dom/client';
import RootApp from './components/RootApp';

function bootstrap() {
  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(React.createElement(RootApp));
}

bootstrap();
