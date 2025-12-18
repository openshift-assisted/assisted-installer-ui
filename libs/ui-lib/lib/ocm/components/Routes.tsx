import React from 'react';
import { Provider } from 'react-redux';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  unstable_HistoryRouter as HistoryRouter,
  HistoryRouterProps,
} from 'react-router-dom-v5-compat';
import { Clusters, ClusterPage, NewClusterPage } from './clusters';
import type { FeatureListType } from '../../common/features/featureGate';
import { AssistedUILibVersion } from './ui';
import { storeDay1 } from '../store';
import { useFeatureDetection } from '../hooks/use-feature-detection';
import './Routes.css';

export const UILibRoutes = ({
  allEnabledFeatures,
  children,
  history,
  basename,
  additionalComponents,
}: {
  allEnabledFeatures: FeatureListType;
  children?: React.ReactNode;
  history?: HistoryRouterProps['history'];
  basename?: string;
  additionalComponents?: React.ReactNode;
}) => {
  useFeatureDetection(allEnabledFeatures);

  const routes = (
    <>
      <Routes>
        <Route path="assisted-installer/clusters" element={<Outlet />}>
          <Route path="~new" element={<NewClusterPage />} />
          <Route path=":clusterId" element={<ClusterPage />} />
          <Route index element={<Clusters />} />
        </Route>
        {children}
        <Route path="*" element={<Navigate to="assisted-installer/clusters" />} />
      </Routes>
      {additionalComponents}
    </>
  );

  return (
    <Provider store={storeDay1}>
      <AssistedUILibVersion />
      {history ? (
        <HistoryRouter history={history} basename={basename || '/'}>
          {routes}
        </HistoryRouter>
      ) : (
        routes
      )}
    </Provider>
  );
};
