import { Formik, FormikProps } from 'formik';
import { noop } from 'lodash';
import * as React from 'react';
import { Ref } from 'react';
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
  formRef: Ref<FormikProps<ClusterDetailsValues>>;
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents?: AgentK8sResource[];
  defaultBaseDomain?: string;
  pullSecret?: string;
};

const ACMClusterDeploymentDetailsStep: React.FC<ACMClusterDeploymentDetailsStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  clusterImages,
  formRef,
  onValuesChanged,
  usedClusterNames,
  agents,
  defaultBaseDomain,
  pullSecret,
}) => {
  const [initialValues, validationSchema] = useDetailsFormik({
    clusterDeployment,
    agentClusterInstall,
    clusterImages,
    usedClusterNames,
    agents,
    defaultBaseDomain,
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      innerRef={formRef}
      onSubmit={noop}
    >
      <ClusterDeploymentDetailsForm
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
        onValuesChanged={onValuesChanged}
        clusterImages={clusterImages}
        pullSecret={pullSecret}
      />
    </Formik>
  );
};

export default ACMClusterDeploymentDetailsStep;
