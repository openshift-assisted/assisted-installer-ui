import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { ClusterDetailsFormFields, ClusterDetailsFormFieldsProps } from '../../../common';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { getOCPVersions, getSelectedVersion } from '../helpers';

type ClusterDeploymentDetailsFormProps = {
  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  pullSecret?: string;
  extensionAfter?: ClusterDetailsFormFieldsProps['extensionAfter'];
};

const ClusterDeploymentDetailsForm: React.FC<ClusterDeploymentDetailsFormProps> = ({
  agentClusterInstall,
  clusterDeployment,
  clusterImages,
  pullSecret,
  extensionAfter,
}) => {
  const ocpVersions = React.useMemo(() => getOCPVersions(clusterImages), [clusterImages]);
  const forceOpenshiftVersion = agentClusterInstall
    ? getSelectedVersion(clusterImages, agentClusterInstall)
    : undefined;
  const isEditFlow = !!clusterDeployment;
  return (
    <Stack hasGutter>
      {isEditFlow && (
        <StackItem>
          <Alert
            isInline
            variant="info"
            title="This option is not editable after the draft cluster was created."
          />
        </StackItem>
      )}
      <StackItem>
        <ClusterDetailsFormFields
          versions={ocpVersions}
          canEditPullSecret={!clusterDeployment}
          isPullSecretSet={!!clusterDeployment?.spec?.pullSecretRef?.name}
          isNameDisabled={isEditFlow}
          isBaseDnsDomainDisabled={isEditFlow}
          forceOpenshiftVersion={forceOpenshiftVersion}
          isOcm={false}
          defaultPullSecret={pullSecret}
          extensionAfter={extensionAfter}
        />
      </StackItem>
    </Stack>
  );
};

export default ClusterDeploymentDetailsForm;
