import React from 'react';
import { AlertsContextProvider } from '../../../common';
import { AssistedUILibVersion } from '../ui';
import { HostsClusterDetailTabContent } from './HostsClusterDetailTabContent';
import { HostsClusterDetailTabProps } from './types';

export const HostsClusterDetailTab = (props: HostsClusterDetailTabProps) => (
  <>
    <AssistedUILibVersion />
    <AlertsContextProvider>
      <HostsClusterDetailTabContent {...props} />
    </AlertsContextProvider>
  </>
);
