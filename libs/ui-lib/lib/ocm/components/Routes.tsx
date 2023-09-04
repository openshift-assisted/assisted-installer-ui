import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Clusters, ClusterPage, NewClusterPage } from './clusters';
import { FeatureGateContextProvider } from '../../common';
import type { FeatureListType } from '../../common/features/featureGate';
import { routeBasePath } from '../config';
import { AssistedUILibVersion } from './ui';
import { storeDay1 } from '../store';
import { featureFlagsActions } from '../store/slices/feature-flags/slice';

export const Routes: React.FC<{ allEnabledFeatures: FeatureListType }> = ({
  allEnabledFeatures,
  children,
}) => {
  useEffect(() => {
    storeDay1.dispatch(featureFlagsActions.setFeatureFlags(allEnabledFeatures));
  }, [allEnabledFeatures]);

  return (
    <Provider store={storeDay1}>
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
};
