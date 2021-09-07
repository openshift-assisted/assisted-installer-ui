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
import ConfirmationModal from '../../../common/components/ui/ConfirmationModal';

const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  agentLocations,
  matchingAgents,
  onAgentSelectorChange,
  // allAgentsCount,
  usedAgentLabels,
  hostActions,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const [isConfirmAutoSelectHostsSwitchOpen, setConfirmAutoSelectHostsSwitch] = React.useState(
    false,
  );
  const { autoSelectHosts, isSNOCluster } = values;

  const onChangeCustomOverride =
    !values.autoSelectHosts && (values.agentLabels.length > 0 || values.selectedHostIds.length > 0)
      ? () => {
          setConfirmAutoSelectHostsSwitch(true);
        }
      : undefined;

  const onAutoSelectConfirmed = () => {
    setFieldValue('autoSelectHosts', !values.autoSelectHosts);
    setFieldValue('agentLabels', []);
    setFieldValue('selectedHostIds', []);
    setConfirmAutoSelectHostsSwitch(false);
  };

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
        <SwitchField
          name="autoSelectHosts"
          label="Auto-select hosts"
          onChangeCustomOverride={onChangeCustomOverride}
        />
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

      {isConfirmAutoSelectHostsSwitchOpen && (
        <ConfirmationModal
          title="Renounce labels and hosts selection"
          content={
            <>
              By changing the view, entered hosts selection and labels will be lost.
              <br />
              Do you want to continue?
            </>
          }
          onClose={() => setConfirmAutoSelectHostsSwitch(false)}
          onConfirm={onAutoSelectConfirmed}
        />
      )}
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
