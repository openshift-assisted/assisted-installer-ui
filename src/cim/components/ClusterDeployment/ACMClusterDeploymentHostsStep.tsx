import { Alert, Stack, StackItem } from '@patternfly/react-core';
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
  error?: string;
};

const ACMClusterDeploymentHostsStep: React.FC<ACMClusterDeploymentHostsStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  formRef,
  onValuesChanged,
  agents,
  error,
}) => {
  const [initialValues, validationSchema] = useHostsSelectionFormik({
    agents,
    clusterDeployment,
    agentClusterInstall,
  });
  return (
    <Stack hasGutter>
      <StackItem>
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
          />
        </Formik>
      </StackItem>
      {error && (
        <StackItem>
          <Alert variant="danger" title="Failed host selection">
            {error}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ACMClusterDeploymentHostsStep;
