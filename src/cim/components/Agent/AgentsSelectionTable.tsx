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
import { usePagination } from '../../../common/components/hosts/usePagination';

const canEditRole = () => true;

type AgentsSelectionTableProps = ClusterDeploymentHostsTablePropsActions & {
  matchingAgents: AgentK8sResource[];
  width?: number;
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({
  matchingAgents,
  onEditRole,
  width,
}) => {
  const [{ value: selectedIDs }, , { setValue, setTouched }] = useField<
    ClusterDeploymentHostsSelectionValues['selectedHostIds']
  >('selectedHostIds');

  const idsRef = React.useRef(selectedIDs);
  idsRef.current = selectedIDs;

  // workaround for https://github.com/jaredpalmer/formik/issues/2268
  // formik helpers are new a instance on every formik store update :(
  const setValueRef = React.useRef(setValue);
  setValueRef.current = setValue;
  const setTouchedRef = React.useRef(setTouched);
  setTouchedRef.current = setTouched;

  const setFieldValue = React.useCallback(async (ids: string[]) => {
    // eslint-disable-next-line
    await (setValueRef.current as any)(ids, true);
    setTouchedRef.current(true, false);
  }, []);

  React.useEffect(() => {
    const allIds = matchingAgents.map((a) => a.metadata?.uid);
    const presentIds = selectedIDs.filter((id) => allIds.includes(id));
    if (presentIds.length !== selectedIDs.length) {
      setFieldValue(presentIds);
    }
  }, [matchingAgents, setFieldValue, selectedIDs]);

  const onSelect = React.useCallback(
    (agent: AgentK8sResource, selected: boolean) => {
      const newIDs = selected
        ? [...idsRef.current, agent.metadata?.uid || '']
        : idsRef.current.filter((uid: string) => uid !== agent.metadata?.uid);
      setFieldValue(newIDs);
    },
    [setFieldValue],
  );

  const [hosts, actions, actionResolver] = useAgentsTable(
    { agents: matchingAgents },
    { onSelect, onEditRole, canEditRole },
  );

  const addAll = width && width > 700;

  const content = React.useMemo(() => {
    return [
      hostnameColumn(),
      ...(addAll ? [infraEnvColumn(matchingAgents)] : []),
      agentStatusColumn({
        agents: matchingAgents,
        wizardStepId: 'hosts-selection',
      }),
      roleColumn(
        actions.canEditRole,
        actions.onEditRole,
        undefined,
        undefined,
        addAll ? 'left' : 'right',
      ),
      ...(addAll ? [cpuCoresColumn, memoryColumn, disksColumn] : []),
    ];
  }, [matchingAgents, actions.canEditRole, actions.onEditRole, addAll]);

  const paginationProps = usePagination(hosts.length);

  return (
    <HostsTable
      hosts={hosts}
      content={content}
      selectedIDs={selectedIDs}
      actionResolver={actionResolver}
      className="agents-table"
      ExpandComponent={DefaultExpandComponent}
      {...actions}
      {...paginationProps}
    >
      <DefaultEmptyState
        title="No hosts found"
        content="No host matches provided labels/locations"
      />
    </HostsTable>
  );
};

export default AgentsSelectionTable;
