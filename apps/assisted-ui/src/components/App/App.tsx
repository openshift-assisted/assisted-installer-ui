import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import { Page } from '@patternfly/react-core';
import * as OCM from '@openshift-assisted/ui-lib/ocm';
import Header from './components/Header';
import BackgroundImage from './components/BackgroundImage';
import '../../i18n';

const {
  HostsClusterDetailTabMock: Day2AddHostsMock,
  Router: LibRouter,
  Features,
  Store,
  Config,
} = OCM;
window.__app__ = { OCM };
const { routeBasePath } = Config;
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
        <LibRouter features={Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES}>
          <Route path={`${routeBasePath}/day2-flow-mock`} component={Day2AddHostsMock} />
        </LibRouter>
      </Page>
    </BrowserRouter>
  </Provider>
);

export default App;
