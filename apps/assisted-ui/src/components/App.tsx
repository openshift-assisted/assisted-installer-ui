import type React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { Page } from '@patternfly/react-core';
import * as OCM from '@openshift-assisted/ui-lib/ocm';
import { Header } from './Header';
import '../i18n';

const { HostsClusterDetailTabMock, Routes, Features, Config } = OCM;
window.__app__ = { OCM };

export const App: React.FC = () => (
  <BrowserRouter basename={Config.routeBasePath}>
    <CompatRouter>
      <Page header={<Header />} isManagedSidebar defaultManagedSidebarIsOpen={false}>
        <Routes allEnabledFeatures={Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES}>
          <Route path={'/day2-flow-mock'}>
            <HostsClusterDetailTabMock />
          </Route>
        </Routes>
      </Page>
    </CompatRouter>
  </BrowserRouter>
);
