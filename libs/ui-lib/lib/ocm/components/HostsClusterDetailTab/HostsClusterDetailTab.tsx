import React from 'react';
import { Provider } from 'react-redux';
import { AssistedUILibVersion } from '../ui';
import { AlertsContextProvider, FeatureGateContextProvider } from '../../../common';
import { HostsClusterDetailTabContent } from './HostsClusterDetailTabContent';
import { HostsClusterDetailTabProps } from './types';
import { storeDay1 } from '../../store';
import { useFeatureDetection } from '../../hooks/use-feature-detection';

const HostsClusterDetailTab = (props: HostsClusterDetailTabProps) => {
  useFeatureDetection();

  return (
    <Provider store={storeDay1}>
      <AssistedUILibVersion />
      <FeatureGateContextProvider features={props.allEnabledFeatures}>
        <AlertsContextProvider>
          <HostsClusterDetailTabContent {...props} />
        </AlertsContextProvider>
      </FeatureGateContextProvider>
    </Provider>
  );
};

export default HostsClusterDetailTab;
