import { Formik, FormikProps } from 'formik';
import { noop } from 'lodash';
import * as React from 'react';
import { Ref } from 'react';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  ConfigMapK8sResource,
  InfraEnvK8sResource,
} from '../../types';
import ClusterDeploymentNetworkingForm from './ClusterDeploymentNetworkingForm';
import { useNetworkingFormik } from './use-networking-formik';
import {
  ClusterDeploymentHostsTablePropsActions,
  ClusterDeploymentNetworkingValues,
} from './types';

type ACMClusterDeploymentNetworkingStepProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  formRef: Ref<FormikProps<ClusterDeploymentNetworkingValues>>;
  agents: AgentK8sResource[];
  onValuesChanged: (values: ClusterDeploymentNetworkingValues) => void;
  hostActions: ClusterDeploymentHostsTablePropsActions;
  aiConfigMap: ConfigMapK8sResource | undefined;
  fetchInfraEnv: (name: string, namespace: string) => Promise<InfraEnvK8sResource>;
};

const ACMClusterDeploymentNetworkingStep: React.FC<ACMClusterDeploymentNetworkingStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  formRef,
  onValuesChanged,
  fetchInfraEnv,
  ...rest
}) => {
  const {
    initialValues,
    validationSchema,
    infraEnvsError,
    infraEnvWithProxy,
    sameProxies,
    infraEnvsLoading,
  } = useNetworkingFormik({
    clusterDeployment,
    agentClusterInstall,
    agents,
    fetchInfraEnv,
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      innerRef={formRef}
      onSubmit={noop}
    >
      <ClusterDeploymentNetworkingForm
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
        agents={agents}
        onValuesChanged={onValuesChanged}
        infraEnvWithProxy={infraEnvWithProxy}
        infraEnvsError={infraEnvsError}
        sameProxies={sameProxies}
        infraEnvsLoading={infraEnvsLoading}
        {...rest}
      />
    </Formik>
  );
};

export default ACMClusterDeploymentNetworkingStep;
