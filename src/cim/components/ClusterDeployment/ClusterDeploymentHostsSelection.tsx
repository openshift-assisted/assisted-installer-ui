import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem, TextContent } from '@patternfly/react-core';
import { ClusterWizardStepHeader, Host, SwitchField } from '../../../common';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import ClusterDeploymentHostsSelectionBasic from './ClusterDeploymentHostsSelectionBasic';
import ClusterDeploymentHostsSelectionAdvanced from './ClusterDeploymentHostsSelectionAdvanced';
import { getAgentStatus } from '../helpers';

const LISTED_HOST_STATUSES: Host['status'][] = [
  'known',
  'known-unbound',
  'insufficient',
  'insufficient-unbound',
  'pending-for-input',
  'discovering',
  'discovering-unbound',
];

const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  agentClusterInstall,
  clusterDeployment,
  agents,
  hostActions,
  onValuesChanged,
}) => {
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  React.useEffect(() => onValuesChanged?.(values), [values, onValuesChanged]);

  const { autoSelectHosts } = values;
  const isSNOCluster = agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1;

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  const availableAgents = React.useMemo(() => {
    return (agents || []).filter((agent) => {
      const [status] = getAgentStatus(agent);
      return (
        LISTED_HOST_STATUSES.includes(status) &&
        agent.spec?.approved &&
        ((agent.spec.clusterDeploymentName?.name === cdName &&
          agent.spec.clusterDeploymentName?.namespace === cdNamespace) ||
          (!agent.spec.clusterDeploymentName?.name && !agent.spec.clusterDeploymentName?.namespace))
      );
    });
  }, [agents, cdNamespace, cdName]);

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>Hosts selection</ClusterWizardStepHeader>
        <TextContent>
          {isSNOCluster
            ? 'Exactly 1 host is required, capable of functioning both as control plane (master) and worker node.'
            : 'At least 3 hosts are required, capable of functioning as control plane (master) nodes.'}
        </TextContent>
      </GridItem>

      <GridItem>
        <SwitchField name="autoSelectHosts" label="Auto-select hosts" />
      </GridItem>

      {autoSelectHosts && (
        <ClusterDeploymentHostsSelectionBasic
          availableAgents={availableAgents}
          isSNOCluster={isSNOCluster}
        />
      )}

      {!autoSelectHosts && (
        <ClusterDeploymentHostsSelectionAdvanced
          availableAgents={availableAgents}
          hostActions={hostActions}
        />
      )}
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
