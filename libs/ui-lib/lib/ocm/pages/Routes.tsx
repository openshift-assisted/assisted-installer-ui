import React from 'react';
import { Provider } from 'react-redux';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  unstable_HistoryRouter as HistoryRouter,
  HistoryRouterProps,
} from 'react-router';
import type { FeatureListType } from '../../common/features/featureGate';
import { storeDay1 } from '../store';
import { AssistedUILibVersion } from '../components';
import { useFeatureDetection } from '../hooks';
import { NewClusterPage } from './newClusterPage';
import { ClusterPage } from './clusterPage';
import { ClusterListPage } from './clusterListPage';
import './Routes.css';

import './Routes.css';

type UILibRoutesProps = {
  allEnabledFeatures: FeatureListType;
  children?: React.ReactNode;
  history?: HistoryRouterProps['history'];
  basename?: string;
};

export const UILibRoutes = ({
  allEnabledFeatures,
  children,
  history,
  basename,
}: UILibRoutesProps) => {
  useFeatureDetection(allEnabledFeatures);

  const routes = (
    <>
      <Routes>
        <Route path="assisted-installer/clusters" element={<Outlet />}>
          <Route path="~new" element={<NewClusterPage />} />
          <Route path=":clusterId" element={<ClusterPage />} />
          <Route index element={<ClusterListPage />} />
        </Route>
        {children}
        <Route path="*" element={<Navigate to="/assisted-installer/clusters" />} />
      </Routes>
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
