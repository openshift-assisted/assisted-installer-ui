import { Formik } from 'formik';
import { noop } from 'lodash';
import * as React from 'react';
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

type ACMClusterDeploymentNetworkingStepProps = ClusterDeploymentHostsTablePropsActions & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  pullSecretSet: boolean;
  agents: AgentK8sResource[];
  onValuesChanged: (values: ClusterDeploymentNetworkingValues) => void;
};

const ACMClusterDeploymentNetworkingStep: React.FC<ACMClusterDeploymentNetworkingStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
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
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={noop}>
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
