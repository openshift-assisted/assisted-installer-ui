import { Formik } from 'formik';
import { noop } from 'lodash';
import * as React from 'react';
import { ClusterDetailsValues } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import ClusterDeploymentDetailsForm from './ClusterDeploymentDetailsForm';
import { useDetailsFormik } from './ClusterDeploymentDetailsStep';

type ACMClusterDeploymentDetailsStepProps = {
  clusterImages: ClusterImageSetK8sResource[];
  onValuesChanged: (values: ClusterDetailsValues) => void;
  usedClusterNames: string[];
  defaultPullSecret?: string;
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  pullSecretSet?: boolean;
  agents?: AgentK8sResource[];
};

const ACMClusterDeploymentDetailsStep: React.FC<ACMClusterDeploymentDetailsStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  clusterImages,
  pullSecretSet,
  defaultPullSecret,
  onValuesChanged,
  usedClusterNames,
  agents,
}) => {
  const [initialValues, validationSchema] = useDetailsFormik({
    clusterDeployment,
    agentClusterInstall,
    pullSecretSet,
    defaultPullSecret,
    clusterImages,
    usedClusterNames,
    agents,
  });
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={noop}>
      <ClusterDeploymentDetailsForm
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
        pullSecretSet={pullSecretSet}
        onValuesChanged={onValuesChanged}
        clusterImages={clusterImages}
        defaultPullSecret={defaultPullSecret}
      />
    </Formik>
  );
};

export default ACMClusterDeploymentDetailsStep;
