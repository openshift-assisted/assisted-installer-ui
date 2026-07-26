import React from 'react';
import { UILibRoutes as Routes } from '@openshift-assisted/ui-lib/ocm';
import { HistoryRouterProps } from 'react-router';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { initApp } from '../init/initApp';

const RootApp = () => {
  const { chromeHistory } = useChrome();
  initApp();
  const history = chromeHistory as unknown as HistoryRouterProps['history'];
  const basename = '/openshift';

  return (
    <React.StrictMode>
      <Routes allEnabledFeatures={{}} history={history} basename={basename} />
    </React.StrictMode>
  );
};

export default RootApp;
