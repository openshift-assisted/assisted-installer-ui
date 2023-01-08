import React from 'react';
import { Provider } from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import { Page } from '@patternfly/react-core';
import { Config, Features, Router as LibRouter, Store } from 'openshift-assisted-ui-lib/ocm';
import Header from './Header';
import BackgroundImage from './BackgroundImage';
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
        <LibRouter
          features={
            Config.isSingleClusterMode()
              ? Features.SINGLE_CLUSTER_ENABLED_FEATURES
              : Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES
          }
        />
      </Page>
    </BrowserRouter>
  </Provider>
);
export default App;
