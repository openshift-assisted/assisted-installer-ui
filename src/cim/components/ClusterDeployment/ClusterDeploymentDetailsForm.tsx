import { useFormikContext } from 'formik';
import * as React from 'react';
import { ClusterDetailsFormFields, ClusterDetailsValues } from '../../../common';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { getOCPVersions } from '../helpers';

type ClusterDeploymentDetailsFormProps = {
  clusterImages: ClusterImageSetK8sResource[];
  defaultPullSecret?: string;
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  pullSecretSet?: boolean;
  toggleRedHatDnsService?: (checked: boolean) => void;
  onValuesChanged?: (values: ClusterDetailsValues) => void;
};

const ClusterDeploymentDetailsForm: React.FC<ClusterDeploymentDetailsFormProps> = ({
  agentClusterInstall,
  clusterDeployment,
  pullSecretSet,
  clusterImages,
  defaultPullSecret,
  toggleRedHatDnsService,
  onValuesChanged,
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  React.useEffect(() => onValuesChanged?.(values), [onValuesChanged, values]);
  const ocpVersions = React.useMemo(() => getOCPVersions(clusterImages), [clusterImages]);
  const isEditFlow = !!clusterDeployment;
  return (
    <ClusterDetailsFormFields
      toggleRedHatDnsService={toggleRedHatDnsService}
      versions={ocpVersions}
      defaultPullSecret={defaultPullSecret}
      canEditPullSecret={!clusterDeployment || !pullSecretSet}
      isSNOGroupDisabled={true}
      isNameDisabled={isEditFlow}
      isBaseDnsDomainDisabled={isEditFlow}
      forceOpenshiftVersion={agentClusterInstall?.spec?.imageSetRef?.name}
      isOcm={false}
    />
  );
};

export default ClusterDeploymentDetailsForm;
