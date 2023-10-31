import React from 'react';
import { Provider } from 'react-redux';
import { AssistedUILibVersion } from '../ui';
import { AlertsContextProvider } from '../../../common';
import { HostsClusterDetailTabContent } from './HostsClusterDetailTabContent';
import { HostsClusterDetailTabProps } from './types';
import { storeDay1 } from '../../store';
import { useFeatureDetection } from '../../hooks/use-feature-detection';

const HostsClusterDetailTab = (props: HostsClusterDetailTabProps) => {
  useFeatureDetection(props.allEnabledFeatures);

  return (
    <Provider store={storeDay1}>
      <AssistedUILibVersion />
      <AlertsContextProvider>
        <HostsClusterDetailTabContent {...props} />
      </AlertsContextProvider>
    </Provider>
  );
};

export default HostsClusterDetailTab;
