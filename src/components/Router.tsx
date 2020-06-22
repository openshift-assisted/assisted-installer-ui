import React from 'react';
import { Provider } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Clusters, ClusterPage } from './clusters';
import { store } from '../store';
import { routeBasePath } from '../config';

export const BMRouter: React.FC = () => (
  <Provider store={store}>
    <Router />
  </Provider>
);

export const Router: React.FC = () => (
  <Switch>
    <Route path={`${routeBasePath}/clusters/:clusterId`} component={ClusterPage} />
    <Route path={`${routeBasePath}/clusters`} component={Clusters} />
    <Redirect to={`${routeBasePath}/clusters`} />
  </Switch>
);
