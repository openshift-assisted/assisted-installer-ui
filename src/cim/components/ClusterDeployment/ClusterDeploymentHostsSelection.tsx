import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem, TextContent, Text, Form } from '@patternfly/react-core';
import { SwitchField } from '../../../common';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import ClusterDeploymentHostsSelectionBasic from './ClusterDeploymentHostsSelectionBasic';
import ClusterDeploymentHostsSelectionAdvanced from './ClusterDeploymentHostsSelectionAdvanced';
import { getAgentsForSelection, getIsSNOCluster } from '../helpers';

const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  agentClusterInstall,
  clusterDeployment,
  agents,
  onValuesChanged,
}) => {
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  React.useEffect(() => onValuesChanged?.(values), [values, onValuesChanged]);

  const { autoSelectHosts } = values;
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  const availableAgents = React.useMemo(
    () =>
      getAgentsForSelection(agents).filter(
        (agent) =>
          (agent.spec.clusterDeploymentName?.name === cdName &&
            agent.spec.clusterDeploymentName?.namespace === cdNamespace) ||
          (!agent.spec.clusterDeploymentName?.name && !agent.spec.clusterDeploymentName?.namespace),
      ),
    [agents, cdNamespace, cdName],
  );

  return (
    <Grid hasGutter>
      <GridItem>
        <TextContent>
          <Text component="h3">Number of hosts</Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <TextContent>
          {isSNOCluster
            ? 'Exactly 1 host is required, capable of functioning both as control plane (master) and worker node.'
            : 'At least 3 hosts are required, capable of functioning as control plane (master) nodes.'}
        </TextContent>
      </GridItem>

      <GridItem>
        <Form>
          <SwitchField name="autoSelectHosts" label="Auto-select hosts" />

          {autoSelectHosts && (
            <ClusterDeploymentHostsSelectionBasic
              availableAgents={availableAgents}
              isSNOCluster={isSNOCluster}
            />
          )}

          {!autoSelectHosts && (
            <ClusterDeploymentHostsSelectionAdvanced<ClusterDeploymentHostsSelectionValues>
              availableAgents={availableAgents}
            />
          )}
        </Form>
      </GridItem>
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
