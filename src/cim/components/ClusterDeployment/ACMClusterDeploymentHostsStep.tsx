import { Formik, FormikProps } from 'formik';
import { noop } from 'lodash';
import * as React from 'react';
import { Ref } from 'react';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { useHostsSelectionFormik } from './ClusterDeploymentHostSelectionStep';
import ClusterDeploymentHostsSelection from './ClusterDeploymentHostsSelection';
import { ClusterDeploymentHostsSelectionValues } from './types';

type ACMClusterDeploymentHostsStepProps = {
  onValuesChanged: (values: ClusterDeploymentHostsSelectionValues) => void;
  formRef: Ref<FormikProps<ClusterDeploymentHostsSelectionValues>>;
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
};

const ACMClusterDeploymentHostsStep: React.FC<ACMClusterDeploymentHostsStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  formRef,
  onValuesChanged,
  agents,
}) => {
  const [initialValues, validationSchema] = useHostsSelectionFormik({
    agents,
    clusterDeployment,
    agentClusterInstall,
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      innerRef={formRef}
      onSubmit={noop}
    >
      <ClusterDeploymentHostsSelection
        agents={agents}
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
        onValuesChanged={onValuesChanged}
        hostActions={{}} // TODO
      />
    </Formik>
  );
};

export default ACMClusterDeploymentHostsStep;
