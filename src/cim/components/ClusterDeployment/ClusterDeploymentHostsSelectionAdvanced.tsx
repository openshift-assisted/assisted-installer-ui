import { GridItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import React from 'react';
import { LabelField } from '../../../common';
import HostsTable from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../common/components/hosts/tableUtils';
import { AgentK8sResource } from '../../types';
import { AgentTableEmptyState } from '../Agent/AgentTable';
import { infraEnvColumn, statusColumn, useAgentsTable } from '../Agent/tableUtils';
import { AGENT_LOCATION_LABEL_KEY } from '../common';
import LocationsSelector from './LocationsSelector';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
  ClusterDeploymentHostsTablePropsActions,
} from './types';

type AgentsSelectionTableProps = {
  matchingAgents?: AgentK8sResource[];
  actions: ClusterDeploymentHostsTablePropsActions;
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({
  matchingAgents = [],
  actions,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  const onSelect = (agent: AgentK8sResource, selected: boolean) => {
    if (selected) {
      setFieldValue('selectedHostIds', [...values.selectedHostIds, agent.metadata?.uid]);
    } else {
      setFieldValue(
        'selectedHostIds',
        values.selectedHostIds.filter((uid) => uid !== agent.metadata?.uid),
      );
    }
  };

  const [hosts, hostActions, actionResolver] = useAgentsTable(
    { ...actions, onSelect },
    matchingAgents,
  );
  const content = React.useMemo(
    () => [
      hostnameColumn(hostActions.onEditHost),
      statusColumn(matchingAgents, actions.onEditHost),
      infraEnvColumn(matchingAgents),
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
    ],
    [matchingAgents, hostActions, actions],
  );

  return (
    <HostsTable
      hosts={hosts}
      content={content}
      selectedIDs={values.selectedHostIds}
      actionResolver={actionResolver}
      className="agents-table"
      {...hostActions}
    >
      <AgentTableEmptyState />
    </HostsTable>
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
          <AgentsSelectionTable matchingAgents={matchingAgents} actions={hostActions} />
        </GridItem>
      )}
    </>
  );
};

export default ClusterDeploymentHostsSelectionAdvanced;
