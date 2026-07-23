import React from 'react';
import { Provider } from 'react-redux';
import { AlertsContextProvider } from '../../../common';
import { AssistedUILibVersion } from '../../components';
import { storeDay1 } from '../../store';
import { useFeatureDetection } from '../../hooks/use-feature-detection';
import { HostsClusterDetailTabContent } from './HostsClusterDetailTabContent';
import { HostsClusterDetailTabProps } from './types';

export const HostsClusterDetailTab = (props: HostsClusterDetailTabProps) => {
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
