/* eslint-disable react/no-children-prop */
import React from 'react';
import { Provider } from 'react-redux';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Clusters, ClusterPage, NewClusterPage } from './clusters';
import type { FeatureListType } from '../../common/features/featureGate';
import { routeBasePath } from '../config';
import { AssistedUILibVersion } from './ui';
import { storeDay1 } from '../store';
import { useFeatureDetection } from '../hooks/use-feature-detection';

export const Routes: React.FC<{ allEnabledFeatures: FeatureListType }> = ({
  allEnabledFeatures,
  children,
}) => {
  useFeatureDetection(allEnabledFeatures);

  return (
    <Provider store={storeDay1}>
      <AssistedUILibVersion />
      <Switch>
        <Route path={`${routeBasePath}/clusters/~new`} children={<NewClusterPage />} />
        <Route path={`${routeBasePath}/clusters/:clusterId`} children={<ClusterPage />} />
        <Route path={`${routeBasePath}/clusters`} children={<Clusters />} />
        {children}
        <Redirect to={`${routeBasePath}/clusters`} />
      </Switch>
    </Provider>
  );
};
