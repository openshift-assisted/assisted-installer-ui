import * as React from 'react';
import { HostsClusterDetailTab as AIHostsClusterDetailTab } from '@openshift-assisted/ui-lib/ocm';
import { useInitApp } from '../hooks/useInitApp';
import '../i18n';
import { HostsClusterDetailTabProps } from '@openshift-assisted/ui-lib/build/@types/ocm/components/HostsClusterDetailTab/types';

const HostsClusterDetailTab: React.FC<HostsClusterDetailTabProps> = (props) => {
  useInitApp();
  return <AIHostsClusterDetailTab {...props} />;
};

export default HostsClusterDetailTab;
