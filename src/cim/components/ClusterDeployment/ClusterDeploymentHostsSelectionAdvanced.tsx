import { GridItem } from '@patternfly/react-core';
import { ICell } from '@patternfly/react-table';
import { useFormikContext } from 'formik';
import React from 'react';
import {
  ClusterWizardStepHeader,
  getHostToHostTableRowMapper,
  HostToHostTableRowPatcherType,
  LabelField,
} from '../../../common';
import { AgentK8sResource } from '../../types';
import { AgentTable } from '../Agent';
import { getAgentTableColumns } from '../Agent/AgentTable';
import { AGENT_LOCATION_LABEL_KEY, INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';
import { hostToAgent } from '../helpers';
import LocationsSelector from './LocationsSelector';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
  ClusterDeploymentHostsTablePropsActions,
} from './types';

type AgentsSelectionTableProps = {
  matchingAgents?: AgentK8sResource[];
  hostActions: ClusterDeploymentHostsTablePropsActions;
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({
  matchingAgents,
  hostActions,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  const onHostSelected = (agent: AgentK8sResource, selected: boolean) => {
    if (selected) {
      setFieldValue('selectedHostIds', [...values.selectedHostIds, agent.metadata?.uid]);
    } else {
      setFieldValue(
        'selectedHostIds',
        values.selectedHostIds.filter((uid) => uid !== agent.metadata?.uid),
      );
    }
  };

  // Customize default AgentTable columns
  const columns = getAgentTableColumns((colIndex: number, colDefault: ICell) => {
    if (colIndex === 3) {
      // Replace Discovery At
      return { ...colDefault, title: 'Infrastructure env' };
    }
    if (colIndex === 1) {
      // Remove Role column
      return undefined;
    }
    return colDefault;
  });

  const rowPatcher: HostToHostTableRowPatcherType = (getDefaultValueFunc, host, colIndex) => {
    if (colIndex === 1) {
      return undefined;
    }
    if (colIndex === 3) {
      const agent = hostToAgent(matchingAgents, host);
      const infraEnvName = agent.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY] || 'N/A';

      return {
        title: infraEnvName,
        props: { 'data-testid': 'infra-env' },
        sortableValue: infraEnvName,
      };
    }
    return getDefaultValueFunc();
  };

  return (
    <AgentTable
      agents={matchingAgents}
      columns={columns}
      hostToHostTableRow={getHostToHostTableRowMapper(rowPatcher)}
      selectedHostIds={values.selectedHostIds}
      onHostSelected={onHostSelected}
      {...hostActions}
    />
  );
};

type ClusterDeploymentHostsSelectionAdvancedProps = Pick<
  ClusterDeploymentHostsSelectionProps,
  'hostActions' | 'agentLocations' | 'onAgentSelectorChange' | 'matchingAgents' | 'usedAgentLabels'
>;

const ClusterDeploymentHostsSelectionAdvanced: React.FC<ClusterDeploymentHostsSelectionAdvancedProps> = ({
  hostActions,
  matchingAgents,
  usedAgentLabels = [],
  agentLocations,
  onAgentSelectorChange,
}) => {
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  const usedAgentLabelsWithoutLocation = usedAgentLabels
    .filter((key) => key !== AGENT_LOCATION_LABEL_KEY)
    .sort();

  return (
    <>
      <GridItem>
        <LocationsSelector
          agentLocations={agentLocations}
          onAgentSelectorChange={onAgentSelectorChange}
        />
      </GridItem>

      <GridItem>
        <LabelField
          label="Labels matching hosts"
          name="agentLabels"
          idPostfix="agentlabels"
          helperText="Please provide as many labels as you can to narrow the list to relevant hosts only."
          forceUniqueKeys={true}
          autocompleteValues={usedAgentLabelsWithoutLocation}
          isDisabled={values.locations.length === 0}
          onChange={(tags: string[]) =>
            onAgentSelectorChange({ labels: tags, locations: values.locations })
          }
        />
      </GridItem>

      {!!values.locations.length && (
        <GridItem>
          <AgentsSelectionTable matchingAgents={matchingAgents} hostActions={hostActions} />
        </GridItem>
      )}
    </>
  );
};

export default ClusterDeploymentHostsSelectionAdvanced;
