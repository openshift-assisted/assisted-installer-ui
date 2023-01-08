import React from 'react';
import { Provider } from 'react-redux';
import { AssistedUILibVersion } from '../ui';
import { AlertsContextProvider } from '../../../common';
import { HostsClusterDetailTabContent } from './HostsClusterDetailTabContent';
import { HostsClusterDetailTabProps } from './types';
import { store } from '../../store';

const HostsClusterDetailTab = (props: HostsClusterDetailTabProps) => (
  <Provider store={store}>
    <AssistedUILibVersion />
    <AlertsContextProvider>
      <HostsClusterDetailTabContent {...props} />
    </AlertsContextProvider>
  </Provider>
);

export default HostsClusterDetailTab;
