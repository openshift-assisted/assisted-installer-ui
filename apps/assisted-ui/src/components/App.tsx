import type React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CompatRouter, Route } from 'react-router-dom-v5-compat';
import { Page } from '@patternfly/react-core';
import * as OCM from '@openshift-assisted/ui-lib/ocm';
import { Header } from './Header';
import '../i18n';

const { HostsClusterDetailTabMock, UILibRoutes, Features, Config } = OCM;
window.__app__ = { OCM };

export const App: React.FC = () => (
  <BrowserRouter basename={Config.routeBasePath}>
    <CompatRouter>
      <Page header={<Header />} isManagedSidebar defaultManagedSidebarIsOpen={false}>
        <UILibRoutes allEnabledFeatures={Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES}>
          <Route path={'/day2-flow-mock'} element={<HostsClusterDetailTabMock />} />
        </UILibRoutes>
      </Page>
    </CompatRouter>
  </BrowserRouter>
);
