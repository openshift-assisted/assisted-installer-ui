import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { Formik, FormikProps } from 'formik';
import { noop } from 'lodash';
import { useHostsDiscoveryFormik } from './ClusterDeploymentHostsDiscoveryStep';
import ClusterDeploymentHostsDiscovery from './ClusterDeploymentHostsDiscovery';
import {
  ClusterDeploymentHostsDiscoveryValues,
  ClusterDeploymentHostsDiscoveryProps,
} from './types';

type ACMClusterDeploymentHostsDiscoveryStepProps = ClusterDeploymentHostsDiscoveryProps & {
  formRef: React.Ref<FormikProps<ClusterDeploymentHostsDiscoveryValues>>;
  error?: string;
};

const ACMClusterDeploymentHostsDiscoveryStep: React.FC<ACMClusterDeploymentHostsDiscoveryStepProps> = ({
  formRef,
  error,
  // clusterDeployment,
  agentClusterInstall,
  agents,
  ...restProps
}) => {
  const [initialValues, validationSchema] = useHostsDiscoveryFormik({
    agents,
    // clusterDeployment,
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
          <ClusterDeploymentHostsDiscovery
            // clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            {...restProps}
          />
        </Formik>
      </StackItem>
      {error && (
        <StackItem>
          <Alert variant="danger" title="Failed host discovery">
            {error}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ACMClusterDeploymentHostsDiscoveryStep;
