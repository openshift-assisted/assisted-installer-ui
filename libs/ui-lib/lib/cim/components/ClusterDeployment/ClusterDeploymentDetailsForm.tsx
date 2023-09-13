import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { getOCPVersions, getSelectedVersion } from '../helpers';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  ClusterDetailsFormFields,
  ClusterDetailsFormFieldsProps,
} from './ClusterDetailsFormFields';

type ClusterDeploymentDetailsFormProps = {
  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  extensionAfter?: ClusterDetailsFormFieldsProps['extensionAfter'];
  isNutanix?: boolean;
};

const ClusterDeploymentDetailsForm: React.FC<ClusterDeploymentDetailsFormProps> = ({
  agentClusterInstall,
  clusterDeployment,
  clusterImages,
  extensionAfter,
  isNutanix,
}) => {
  const ocpVersions = React.useMemo(
    () => getOCPVersions(clusterImages, isNutanix),
    [clusterImages, isNutanix],
  );
  const forceOpenshiftVersion = agentClusterInstall
    ? getSelectedVersion(clusterImages, agentClusterInstall)
    : undefined;
  const isEditFlow = !!clusterDeployment;
  const { t } = useTranslation();
  return (
    <Stack hasGutter>
      {isEditFlow && (
        <StackItem>
          <Alert
            isInline
            variant="info"
            title={t('ai:Some details are not editable after the draft cluster was created.')}
          />
        </StackItem>
      )}
      <StackItem>
        <ClusterDetailsFormFields
          versions={ocpVersions}
          isEditFlow={isEditFlow}
          forceOpenshiftVersion={forceOpenshiftVersion}
          extensionAfter={extensionAfter}
          isNutanix={isNutanix}
        />
      </StackItem>
    </Stack>
  );
};

export default ClusterDeploymentDetailsForm;
