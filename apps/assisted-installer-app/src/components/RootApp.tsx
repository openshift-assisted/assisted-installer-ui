import React from 'react';
import { UILibRoutes as Routes } from '@openshift-assisted/ui-lib/ocm';
import { HistoryRouterProps } from 'react-router-dom-v5-compat';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { useInitApp } from '../hooks/useInitApp';

const RootApp = () => {
  const { chromeHistory } = useChrome();
  useInitApp();
  return (
    <React.StrictMode>
      <div style={{ overflowY: 'auto', height: '100%' }}>
        <Routes
          allEnabledFeatures={{}}
          history={chromeHistory as unknown as HistoryRouterProps['history']}
          basename="/openshift"
        />
      </div>
    </React.StrictMode>
  );
};

export default RootApp;
