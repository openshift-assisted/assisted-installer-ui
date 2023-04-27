import React from 'react';
import { Provider } from 'react-redux';
import { AssistedUILibVersion } from '../ui';
import { AlertsContextProvider, FeatureGateContextProvider } from '../../../common';
import { HostsClusterDetailTabContent } from './HostsClusterDetailTabContent';
import { HostsClusterDetailTabProps } from './types';
import { store } from '../../store';

const HostsClusterDetailTab = (props: HostsClusterDetailTabProps) => (
  <Provider store={store}>
    <AssistedUILibVersion />
    <FeatureGateContextProvider features={props.allEnabledFeatures}>
      <AlertsContextProvider>
        <HostsClusterDetailTabContent {...props} />
      </AlertsContextProvider>
    </FeatureGateContextProvider>
  </Provider>
);

export default HostsClusterDetailTab;
