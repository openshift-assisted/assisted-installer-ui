import * as React from 'react';
import {
  HostsClusterDetailTab as AIHostsClusterDetailTab,
  HostsClusterDetailTabProps,
} from '@openshift-assisted/ui-lib/ocm';
import { initApp } from '../init/initApp';
import '../i18n';

const HostsClusterDetailTab: React.FC<HostsClusterDetailTabProps> = (props) => {
  initApp();
  return <AIHostsClusterDetailTab {...props} />;
};

export default HostsClusterDetailTab;
