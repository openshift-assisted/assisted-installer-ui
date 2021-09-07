import { GridItem } from '@patternfly/react-core';
import * as _ from 'lodash';
import { useField, useFormikContext } from 'formik';
import React from 'react';
import HostsTable from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../common/components/hosts/tableUtils';
import { AgentK8sResource } from '../../types';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';
import { infraEnvColumn, statusColumn, useAgentsTable } from '../Agent/tableUtils';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';
import LocationsSelector from './LocationsSelector';
import {
  ClusterDeploymentHostsSelectionValues,
  ClusterDeploymentHostsTablePropsActions,
} from './types';
import LabelsSelector from './LabelsSelector';

type AgentsSelectionTableProps = {
  matchingAgents: AgentK8sResource[];
  actions: ClusterDeploymentHostsTablePropsActions;
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({ matchingAgents, actions }) => {
  const [selectedHostIdsField, , { setValue: setSelectedHostIdsValue }] = useField<
    ClusterDeploymentHostsSelectionValues['selectedHostIds']
  >('selectedHostIds');

  React.useEffect(() => {
    const allIds = matchingAgents.map((a) => a.metadata?.uid);
    const presentIds = selectedHostIdsField.value.filter((id) => allIds.includes(id));
    if (presentIds.length !== selectedHostIdsField.value.length) {
      setSelectedHostIdsValue(presentIds);
    }
  }, [matchingAgents, setSelectedHostIdsValue, selectedHostIdsField.value]);

  const onSelect = (agent: AgentK8sResource, selected: boolean) => {
    if (selected) {
      setSelectedHostIdsValue([...selectedHostIdsField.value, agent.metadata?.uid || '']);
    } else {
      setSelectedHostIdsValue(
        selectedHostIdsField.value.filter((uid: string) => uid !== agent.metadata?.uid),
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
      selectedIDs={selectedHostIdsField.value}
      actionResolver={actionResolver}
      className="agents-table"
      {...hostActions}
    >
      <DefaultEmptyState
        title="No hosts found"
        content="No host matches provided labels/locations"
      />
    </HostsTable>
  );
};

type ClusterDeploymentHostsSelectionAdvancedProps = {
  availableAgents: AgentK8sResource[];
  hostActions: ClusterDeploymentHostsTablePropsActions;
};

const ClusterDeploymentHostsSelectionAdvanced: React.FC<ClusterDeploymentHostsSelectionAdvancedProps> = ({
  availableAgents,
  hostActions,
}) => {
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  const matchingAgents = React.useMemo(
    () =>
      availableAgents.filter((agent) => {
        const labels = values.agentLabels.reduce((acc, curr) => {
          const label = curr.split('=');
          acc[label[0]] = label[1];
          return acc;
        }, {});
        const matchesLocation = values.locations.length
          ? values.locations.includes(
              agent.metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE,
            )
          : true;
        const matchesLabels = agent.metadata?.labels
          ? _.isMatch(agent.metadata?.labels, labels)
          : true;
        return matchesLocation && matchesLabels;
      }),
    [availableAgents, values.locations, values.agentLabels],
  );

  return (
    <>
      <GridItem>
        <LocationsSelector agents={availableAgents} />
      </GridItem>
      <GridItem>
        <LabelsSelector agents={matchingAgents} />
      </GridItem>
      <GridItem>
        <AgentsSelectionTable matchingAgents={matchingAgents} actions={hostActions} />
      </GridItem>
    </>
  );
};

export default ClusterDeploymentHostsSelectionAdvanced;
