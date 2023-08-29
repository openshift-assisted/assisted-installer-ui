import { BrowserRouter, Route } from 'react-router-dom';
import { Page } from '@patternfly/react-core';
import * as OCM from '@openshift-assisted/ui-lib/ocm';
import Header from './components/Header';
import BackgroundImage from './components/BackgroundImage';
import '../../i18n';

const { HostsClusterDetailTabMock, Routes, Features, Config } = OCM;
window.__app__ = { OCM };
const { routeBasePath } = Config;

const App = () => (
  <BrowserRouter>
    <BackgroundImage />
    <Page
      header={<Header />}
      style={{ height: '100vh', background: 'transparent' }}
      isManagedSidebar
      defaultManagedSidebarIsOpen={false}
    >
      <Routes allEnabledFeatures={Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES}>
        <Route path={`${routeBasePath}/day2-flow-mock`} component={HostsClusterDetailTabMock} />
      </Routes>
    </Page>
  </BrowserRouter>
);

export default App;
