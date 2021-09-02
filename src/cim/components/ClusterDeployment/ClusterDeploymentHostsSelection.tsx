import React from 'react';
import { useField } from 'formik';
import { Grid, GridItem, TextContent } from '@patternfly/react-core';
import { ClusterWizardStepHeader } from '../../../common';
import { ClusterDeploymentHostsSelectionProps } from './types';
import ClusterDeploymentHostsSelectionBasic from './ClusterDeploymentHostsSelectionBasic';
import ClusterDeploymentHostsSelectionAdvanced from './ClusterDeploymentHostsSelectionAdvanced';
import AutoSelectHostsSwitch from './AutoSelectHostsSwitch';

const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  agentLocations,
  matchingAgents,
  onAgentSelectorChange,
  // allAgentsCount,
  usedAgentLabels,
  hostActions,
}) => {
  const [{ value: autoSelectHosts }] = useField('autoSelectHosts');
  const [{ value: isSNOCluster }] = useField('isSNOCluster');

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
        <AutoSelectHostsSwitch />
      </GridItem>

      {autoSelectHosts && (
        <ClusterDeploymentHostsSelectionBasic
          agentLocations={agentLocations}
          onAgentSelectorChange={onAgentSelectorChange}
          matchingAgents={matchingAgents}
        />
      )}

      {!autoSelectHosts && (
        <ClusterDeploymentHostsSelectionAdvanced
          agentLocations={agentLocations}
          usedAgentLabels={usedAgentLabels}
          onAgentSelectorChange={onAgentSelectorChange}
          hostActions={hostActions}
          matchingAgents={matchingAgents}
        />
      )}
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
