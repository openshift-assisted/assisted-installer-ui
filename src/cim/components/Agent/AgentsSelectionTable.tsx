import React from 'react';
import { useField } from 'formik';
import HostsTable, { DefaultExpandComponent } from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../common/components/hosts/tableUtils';
import { AgentK8sResource } from '../../types/k8s/agent';
import { ClusterDeploymentHostsSelectionValues } from '../ClusterDeployment/types';
import { hardwareStatusColumn, infraEnvColumn, useAgentsTable } from './tableUtils';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';

type AgentsSelectionTableProps = {
  matchingAgents: AgentK8sResource[];
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({ matchingAgents }) => {
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

  const [hosts, actions, actionResolver] = useAgentsTable({ onSelect }, { agents: matchingAgents });
  const content = React.useMemo(
    () => [
      hostnameColumn(),
      infraEnvColumn(matchingAgents),
      hardwareStatusColumn(),
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
    ],
    [matchingAgents],
  );

  return (
    <HostsTable
      hosts={hosts}
      content={content}
      selectedIDs={selectedHostIdsField.value}
      actionResolver={actionResolver}
      className="agents-table"
      ExpandComponent={DefaultExpandComponent}
      {...actions}
    >
      <DefaultEmptyState
        title="No hosts found"
        content="No host matches provided labels/locations"
      />
    </HostsTable>
  );
};

export default AgentsSelectionTable;
