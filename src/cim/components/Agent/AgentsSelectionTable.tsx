import React from 'react';
import { useField } from 'formik';
import HostsTable, { DefaultExpandComponent } from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import { AgentK8sResource } from '../../types/k8s/agent';
import {
  ClusterDeploymentHostsSelectionValues,
  ClusterDeploymentHostsTablePropsActions,
} from '../ClusterDeployment/types';
import { infraEnvColumn, agentStatusColumn, useAgentsTable } from './tableUtils';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';

type AgentsSelectionTableProps = ClusterDeploymentHostsTablePropsActions & {
  matchingAgents: AgentK8sResource[];
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({
  matchingAgents,
  onEditRole,
}) => {
  const [
    selectedHostIdsField,
    ,
    { setValue: setSelectedHostIdsValue, setTouched: setSelectedHostIdsTouched },
  ] = useField<ClusterDeploymentHostsSelectionValues['selectedHostIds']>('selectedHostIds');

  React.useEffect(() => {
    const allIds = matchingAgents.map((a) => a.metadata?.uid);
    const presentIds = selectedHostIdsField.value.filter((id) => allIds.includes(id));
    if (presentIds.length !== selectedHostIdsField.value.length) {
      setSelectedHostIdsValue(presentIds);
      setSelectedHostIdsTouched(true);
    }
  }, [
    matchingAgents,
    setSelectedHostIdsValue,
    setSelectedHostIdsTouched,
    selectedHostIdsField.value,
  ]);

  const onSelect = (agent: AgentK8sResource, selected: boolean) => {
    if (selected) {
      setSelectedHostIdsValue([...selectedHostIdsField.value, agent.metadata?.uid || '']);
    } else {
      setSelectedHostIdsValue(
        selectedHostIdsField.value.filter((uid: string) => uid !== agent.metadata?.uid),
      );
    }
    setSelectedHostIdsTouched(true);
  };

  const canEditRole = React.useCallback(
    (agent: AgentK8sResource) => selectedHostIdsField.value.includes(agent.metadata?.uid || ''),
    [selectedHostIdsField.value],
  );

  const [hosts, actions, actionResolver] = useAgentsTable(
    { agents: matchingAgents },
    { onSelect, onEditRole, canEditRole },
  );
  const content = React.useMemo(
    () => [
      hostnameColumn(),
      infraEnvColumn(matchingAgents),
      agentStatusColumn({
        agents: matchingAgents,
        wizardStepId: 'hosts-selection',
      }),
      roleColumn(actions.canEditRole, actions.onEditRole),
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
    ],
    [matchingAgents, actions.canEditRole, actions.onEditRole],
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
