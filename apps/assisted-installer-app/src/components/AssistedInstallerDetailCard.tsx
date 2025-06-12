import * as React from 'react';
import { AssistedInstallerDetailCard as AIDetailsCard } from '@openshift-assisted/ui-lib/ocm';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { HistoryRouterProps } from 'react-router-dom-v5-compat';

import { useInitApp } from '../hooks/useInitApp';

type DetailsCardProps = Omit<
  React.ComponentProps<typeof AIDetailsCard>,
  'history' | 'allEnabledFeatures' | 'basename'
>;

const AssistedInstallerDetailCard: React.FC<DetailsCardProps> = (props) => {
  useInitApp();
  const { chromeHistory } = useChrome();
  return (
    <AIDetailsCard
      history={chromeHistory as unknown as HistoryRouterProps['history']}
      allEnabledFeatures={{}}
      basename="/openshift"
      {...props}
    />
  );
};

export default AssistedInstallerDetailCard;
