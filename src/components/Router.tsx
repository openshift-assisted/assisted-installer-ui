import React from 'react';
import { Provider } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Clusters, ClusterPage, NewClusterPage } from './clusters';
import { store } from '../store';
import { isSingleClusterMode, routeBasePath } from '../config/constants';
import SingleCluster from './SingleCluster';
import { AssistedUILibVersion } from './ui';
import { OpenshiftVersionsContextProvider } from './OpenshiftVersionsContextProvider';

export const AssistedUiRouter: React.FC = () => (
  <Provider store={store}>
    <Router />
  </Provider>
);

export const Router: React.FC = ({ children }) => (
  <>
    <AssistedUILibVersion />
    <OpenshiftVersionsContextProvider>
      {isSingleClusterMode() ? (
        <Switch>
          <Route path={`${routeBasePath}/clusters/:clusterId`} component={ClusterPage} />
          <Route path={`${routeBasePath}/clusters`} component={SingleCluster} />
          {children}
          <Redirect to={`${routeBasePath}/clusters`} />
        </Switch>
      ) : (
        <Switch>
          <Route path={`${routeBasePath}/clusters/~new`} component={NewClusterPage} />
          <Route path={`${routeBasePath}/clusters/:clusterId`} component={ClusterPage} />
          <Route path={`${routeBasePath}/clusters`} component={Clusters} />
          {children}
          <Redirect to={`${routeBasePath}/clusters`} />
        </Switch>
      )}
    </OpenshiftVersionsContextProvider>
  </>
);
