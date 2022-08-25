import React from 'react';
import { Cluster, isSNO, useFeature } from '../../../common';
import { Stack, StackItem } from '@patternfly/react-core';
import ClusterWizardStepHeader from '../clusterWizard/ClusterWizardStepHeader';
import { CnvCheckbox } from '../clusterConfiguration/CnvCheckbox';
import { ODFCheckbox } from '../clusterConfiguration/ODFCheckbox';

export const OperatorsStep: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');
  const isContainerNativeVirtualizationEnabled = useFeature('ASSISTED_INSTALLER_CNV_FEATURE');
  const isSNOCluster = isSNO(cluster);

  return (
    <Stack>
      <StackItem>
        <ClusterWizardStepHeader>Operators</ClusterWizardStepHeader>
      </StackItem>
      &nbsp;
      {isContainerNativeVirtualizationEnabled && (
        <StackItem>
          <CnvCheckbox
            clusterId={cluster.id}
            isSNO={isSNOCluster}
            openshiftVersion={cluster.openshiftVersion}
          />
        </StackItem>
      )}
      &nbsp;
      {isOpenshiftClusterStorageEnabled && (
        <StackItem>
          <ODFCheckbox openshiftVersion={cluster.openshiftVersion} />
        </StackItem>
      )}
    </Stack>
  );
};
