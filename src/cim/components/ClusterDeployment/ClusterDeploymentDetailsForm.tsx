import { useFormikContext } from 'formik';
import * as React from 'react';
import {
  ClusterDetailsFormFields,
  ClusterDetailsFormFieldsProps,
  ClusterDetailsValues,
} from '../../../common';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { getOCPVersions } from '../helpers';

type ClusterDeploymentDetailsFormProps = {
  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  toggleRedHatDnsService?: (checked: boolean) => void;
  onValuesChanged?: (values: ClusterDetailsValues) => void;
  pullSecret?: string;
  extensionAfter?: ClusterDetailsFormFieldsProps['extensionAfter'];
};

const ClusterDeploymentDetailsForm: React.FC<ClusterDeploymentDetailsFormProps> = ({
  agentClusterInstall,
  clusterDeployment,
  clusterImages,
  toggleRedHatDnsService,
  onValuesChanged,
  pullSecret,
  extensionAfter,
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  React.useEffect(() => onValuesChanged?.(values), [onValuesChanged, values]);
  const ocpVersions = React.useMemo(() => getOCPVersions(clusterImages), [clusterImages]);
  const isEditFlow = !!clusterDeployment;
  return (
    <ClusterDetailsFormFields
      toggleRedHatDnsService={toggleRedHatDnsService}
      versions={ocpVersions}
      canEditPullSecret={!clusterDeployment}
      isSNOGroupDisabled={!!clusterDeployment /* truish for create flow only */}
      isNameDisabled={isEditFlow}
      isBaseDnsDomainDisabled={isEditFlow}
      forceOpenshiftVersion={agentClusterInstall?.spec?.imageSetRef?.name}
      isOcm={false}
      defaultPullSecret={pullSecret}
      extensionAfter={extensionAfter}
    />
  );
};

export default ClusterDeploymentDetailsForm;
