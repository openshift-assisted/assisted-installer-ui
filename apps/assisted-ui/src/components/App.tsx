import type React from 'react';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';
import { CompatRouter, Route } from 'react-router-dom-v5-compat';
import { Page } from '@patternfly/react-core';
import * as OCM from '@openshift-assisted/ocm';
import { Header } from './Header';
import '../i18n';

const { HostsClusterDetailTabMock, UILibRoutes, Features, Config } = OCM;
window.__app__ = { OCM };

// Add PropsWithChildren to bypass the React 18 type mismatch
// eslint-disable-next-line
const BrowserRouter18 = BrowserRouter as any as React.FC<
  React.PropsWithChildren<BrowserRouterProps>
>;

export const App: React.FC = () => (
  <BrowserRouter18 basename={Config.routeBasePath}>
    <CompatRouter>
      <Page masthead={<Header />} isManagedSidebar defaultManagedSidebarIsOpen={false}>
        <UILibRoutes allEnabledFeatures={Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES}>
          <Route path={'/day2-flow-mock'} element={<HostsClusterDetailTabMock />} />
        </UILibRoutes>
      </Page>
    </CompatRouter>
  </BrowserRouter18>
);
