import React from 'react';
import { Provider } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Clusters, ClusterPage, NewClusterPage } from './clusters';
import { store } from '../store';
import { isSingleClusterMode, routeBasePath } from '../config/constants';
import SingleCluster from './SingleCluster';

export const FacetRouter: React.FC = () => (
  <Provider store={store}>
    <Router />
  </Provider>
);

export const Router: React.FC = ({ children }) => (
  <Switch>
    <Route path={`${routeBasePath}/clusters/~new`} component={NewClusterPage} />
    <Route path={`${routeBasePath}/clusters/:clusterId`} component={ClusterPage} />
    {isSingleClusterMode() ? (
      <Route path={`${routeBasePath}/clusters`} component={SingleCluster} />
    ) : (
      <Route path={`${routeBasePath}/clusters`} component={Clusters} />
    )}
    {children}
    <Redirect to={`${routeBasePath}/clusters`} />
  </Switch>
);
