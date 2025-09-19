import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom-v5-compat';
import {
  Brand,
  Masthead,
  MastheadLogo,
  MastheadMain,
  MastheadBrand,
  Page,
} from '@patternfly/react-core';
import { Provider } from 'react-redux';
import { Store, useFeatureDetection } from '@openshift-assisted/ui-lib/ocm';
import { FeatureListType } from '@openshift-assisted/ui-lib/lib/common';

import CreateClusterWizard from './CreateClusterWizard';
import ClusterPage from './ClusterPage';
import '../i18n';

const features: FeatureListType = {
  ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE: true,
};

const AppRouter = () => {
  useFeatureDetection(features);
  return (
    <Routes>
      <Route path="/" element={<CreateClusterWizard />} />
      <Route path="/:clusterId" element={<ClusterPage />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  const header = (
    <Masthead id="masthead">
      <MastheadMain>
        <MastheadBrand>
          <MastheadLogo>
            <Brand
              src="/logo.svg"
              alt="OpenShift Container Platform Assisted Installer"
              style={{ width: '188px' }}
            >
              <source src="/logo.svg" />
            </Brand>
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  return (
    <BrowserRouter>
      <Provider store={Store.storeDay1}>
        <Page masthead={header} isManagedSidebar defaultManagedSidebarIsOpen={false}>
          <AppRouter />
        </Page>
      </Provider>
    </BrowserRouter>
  );
};
