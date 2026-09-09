import * as React from 'react';
import { HostsClusterDetailTab as AIHostsClusterDetailTab } from '@openshift-assisted/ui-lib/ocm';
import { initApp } from '../init/initApp';
import '../i18n';

const HostsClusterDetailTab: React.FC<React.ComponentProps<typeof AIHostsClusterDetailTab>> = (
  props,
) => {
  initApp();
  return <AIHostsClusterDetailTab {...props} />;
};

export default HostsClusterDetailTab;
