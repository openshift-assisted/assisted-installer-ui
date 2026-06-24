import type React from 'react';
import { BrowserRouter, type BrowserRouterProps } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { Page } from '@patternfly/react-core';
import * as OCM from '@openshift-assisted/ui-lib/ocm';
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
  <BrowserRouter18
    basename={Config.routeBasePath}
    future={{ v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_startTransition: true }}
  >
    <Page masthead={<Header />} isManagedSidebar defaultManagedSidebarIsOpen={false}>
      <UILibRoutes allEnabledFeatures={Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES}>
        <Route path={'/day2-flow-mock'} element={<HostsClusterDetailTabMock />} />
      </UILibRoutes>
    </Page>
  </BrowserRouter18>
);
