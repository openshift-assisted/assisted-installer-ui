import React from 'react';
import { Cluster } from '../../../common';
import { Stack, StackItem } from '@patternfly/react-core';
import ClusterWizardStepHeader from '../clusterWizard/ClusterWizardStepHeader';
import StorageStepTable from './StorageStepTable';

export const StorageStep: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  return (
    <Stack>
      <StackItem>
        <ClusterWizardStepHeader>Storage</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        <StorageStepTable cluster={cluster} />
      </StackItem>
    </Stack>
  );
};
