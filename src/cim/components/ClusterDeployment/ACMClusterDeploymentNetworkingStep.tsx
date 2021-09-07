import { Formik, FormikProps } from 'formik';
import { noop } from 'lodash';
import * as React from 'react';
import { Ref } from 'react';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentNetworkingForm from './ClusterDeploymentNetworkingForm';
import { useNetworkingFormik } from './ClusterDeploymentNetworkingStep';
import {
  ClusterDeploymentHostsTablePropsActions,
  ClusterDeploymentNetworkingValues,
} from './types';

type ACMClusterDeploymentNetworkingStepProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  pullSecretSet: boolean;
  formRef: Ref<FormikProps<ClusterDeploymentNetworkingValues>>;
  agents: AgentK8sResource[];
  onValuesChanged: (values: ClusterDeploymentNetworkingValues) => void;
  hostActions: ClusterDeploymentHostsTablePropsActions;
};

const ACMClusterDeploymentNetworkingStep: React.FC<ACMClusterDeploymentNetworkingStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  formRef,
  pullSecretSet,
  onValuesChanged,
  ...rest
}) => {
  const [initialValues, validationSchema] = useNetworkingFormik({
    clusterDeployment,
    agentClusterInstall,
    agents,
    pullSecretSet,
  });
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema}  innerRef={formRef} onSubmit={noop}>
      <ClusterDeploymentNetworkingForm
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
        agents={agents}
        pullSecretSet={pullSecretSet}
        onValuesChanged={onValuesChanged}
        {...rest}
      />
    </Formik>
  );
};

export default ACMClusterDeploymentNetworkingStep;
