import React from 'react';
import {
  Cluster,
  /*  /!*HostDiscoveryValues,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterUpdateParams,
  getHostDiscoveryInitialValues,*!/*/
} from '../../../common';
import { Stack, StackItem } from '@patternfly/react-core';
import ClusterWizardStepHeader from '../clusterWizard/ClusterWizardStepHeader';
import StorageStepTable from './StorageStepTable';

export const StorageStep: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);

  return (
    <Stack>
      <StackItem>
        <ClusterWizardStepHeader>Storage</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        <StorageStepTable cluster={cluster} setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </StackItem>
    </Stack>
  );
};
