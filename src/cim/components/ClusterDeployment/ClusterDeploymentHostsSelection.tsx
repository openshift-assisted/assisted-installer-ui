import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem, TextContent } from '@patternfly/react-core';
import { ClusterWizardStepHeader, SwitchField } from '../../../common';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import ClusterDeploymentHostsSelectionBasic from './ClusterDeploymentHostsSelectionBasic';
import ClusterDeploymentHostsSelectionAdvanced from './ClusterDeploymentHostsSelectionAdvanced';

const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  agentClusterInstall,
  availableAgents,
  hostActions,
}) => {
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { autoSelectHosts } = values;
  const isSNOCluster = agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1;

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
