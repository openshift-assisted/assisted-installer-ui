import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom-v5-compat';
import { Brand, Masthead, MastheadBrand, MastheadMain, Page } from '@patternfly/react-core';
import '../i18n';
import Wizard from './Wizard';
import { Provider } from 'react-redux';
import { Store } from '@openshift-assisted/ui-lib/ocm';
import EditWizard from './EditWizard';

export const App: React.FC = () => {
  const header = (
    <Masthead id="masthead">
      <MastheadMain>
        <MastheadBrand>
          <Brand
            src="/logo.svg"
            alt="OpenShift Container Platform Assisted Installer"
            style={{ width: '188px' }}
          >
            <source src="/logo.svg" />
          </Brand>
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  return (
    <BrowserRouter>
      <Provider store={Store.storeDay1}>
        <Page header={header} isManagedSidebar defaultManagedSidebarIsOpen={false}>
          <Routes>
            <Route path="/" element={<Wizard />} />
            <Route path=":clusterId" element={<EditWizard />} />
          </Routes>
        </Page>
      </Provider>
    </BrowserRouter>
  );
};
