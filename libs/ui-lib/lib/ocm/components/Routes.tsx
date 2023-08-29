import React from 'react';
import { Provider } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Clusters, ClusterPage, NewClusterPage } from './clusters';
import { store } from '../store';
import { FeatureGateContextProvider, FeatureListType } from '../../common';
import { routeBasePath } from '../config';
import { AssistedUILibVersion } from './ui';

export const Routes: React.FC<{ allEnabledFeatures: FeatureListType }> = ({
  allEnabledFeatures,
  children,
}) => (
  <Provider store={store}>
    <FeatureGateContextProvider features={allEnabledFeatures}>
      <AssistedUILibVersion />
      <Switch>
        <Route path={`${routeBasePath}/clusters/~new`} component={NewClusterPage} />
        <Route path={`${routeBasePath}/clusters/:clusterId`} component={ClusterPage} />
        <Route path={`${routeBasePath}/clusters`} component={Clusters} />
        {children}
        <Redirect to={`${routeBasePath}/clusters`} />
      </Switch>
    </FeatureGateContextProvider>
  </Provider>
);
