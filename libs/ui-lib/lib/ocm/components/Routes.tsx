import React from 'react';
import { Provider } from 'react-redux';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom-v5-compat';
import { Clusters, ClusterPage, NewClusterPage } from './clusters';
import type { FeatureListType } from '../../common/features/featureGate';
import { AssistedUILibVersion } from './ui';
import { storeDay1 } from '../store';
import { useFeatureDetection } from '../hooks/use-feature-detection';

export const UILibRoutes = ({
  allEnabledFeatures,
  children,
}: {
  allEnabledFeatures: FeatureListType;
  children: React.ReactNode;
}) => {
  useFeatureDetection(allEnabledFeatures);

  return (
    <Provider store={storeDay1}>
      <AssistedUILibVersion />
      <Routes>
        <Route path="clusters" element={<Outlet />}>
          <Route path="~new" element={<NewClusterPage />} />
          <Route path=":clusterId" element={<ClusterPage />} />
          <Route index element={<Clusters />} />
        </Route>
        {children}
        <Route path="*" element={<Navigate to="clusters" />} />
      </Routes>
    </Provider>
  );
};
