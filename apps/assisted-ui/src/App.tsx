import React from 'react';
import { Provider } from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import { Page } from '@patternfly/react-core';
import { Features, Router as LibRouter, Store } from 'openshift-assisted-ui-lib/ocm';
import Header from './Header.jsx';
import BackgroundImage from './BackgroundImage.jsx';
import './i18n.js';

const { store } = Store;

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <BackgroundImage />
      <Page
        header={<Header />}
        style={{ height: '100vh', background: 'transparent' }}
        isManagedSidebar
        defaultManagedSidebarIsOpen={false}
      >
        <LibRouter features={Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />
      </Page>
    </BrowserRouter>
  </Provider>
);
export default App;
