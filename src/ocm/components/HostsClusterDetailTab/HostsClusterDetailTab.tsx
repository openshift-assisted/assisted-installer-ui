import React from 'react';
import { Provider } from 'react-redux';
import { AssistedUILibVersion } from '../ui';
import { AlertsContextProvider } from '../../../common';
import { HostsClusterDetailTabContent } from './HostsClusterDetailTabContent';
import { HostsClusterDetailTabProps } from './types';
import { store } from '../../store';

export const HostsClusterDetailTab = (props: HostsClusterDetailTabProps) => (
  <>
    <AssistedUILibVersion />
    <AlertsContextProvider>
      <HostsClusterDetailTabContent {...props} />
    </AlertsContextProvider>
  </>
);

const Wrapper = (props: HostsClusterDetailTabProps) => (
  <Provider store={store}>
    <HostsClusterDetailTab {...props} />
  </Provider>
);

export default Wrapper;
