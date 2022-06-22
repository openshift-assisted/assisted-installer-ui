import React from 'react';
import { useField } from 'formik';
import HostsTable from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  disksColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import { AgentK8sResource } from '../../types/k8s/agent';
import {
  ClusterDeploymentHostsSelectionValues,
  AgentTableActions,
} from '../ClusterDeployment/types';
import {
  infraEnvColumn,
  agentStatusColumn,
  useAgentsTable,
  agentHostnameColumn,
} from './tableUtils';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useFormikHelpers } from '../../../common/hooks/useFormikHelpers';
import { onDiskRoleType } from '../../../common/components/hosts/DiskRole';
import { Host } from '../../../common';
import { Cluster } from '../../../common/api';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { onDiskRole as onDiskRoleUtil } from '../../components/helpers/agents';

type AgentsSelectionTableProps = {
  matchingAgents: AgentK8sResource[];
  width?: number;
  onEditRole?: AgentTableActions['onEditRole'];
  onEditHost?: AgentTableActions['onEditHost'];
  onHostSelect?: VoidFunction;
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: onDiskRoleType;
  cluster?: Cluster;
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({
  matchingAgents,
  onEditRole,
  width,
  onEditHost,
  onHostSelect,
}) => {
  const [{ value: selectedIDs }] =
    useField<ClusterDeploymentHostsSelectionValues['selectedHostIds']>('selectedHostIds');

  const idsRef = React.useRef(selectedIDs);
  idsRef.current = selectedIDs;

  const { setValue, setTouched } =
    useFormikHelpers<ClusterDeploymentHostsSelectionValues['selectedHostIds']>('selectedHostIds');

  const setFieldValue = React.useCallback(
    async (ids: string[]) => {
      await setValue(ids, true);
      setTouched(true, false);
    },
    [setValue, setTouched],
  );

  React.useEffect(() => {
    const allIds = matchingAgents.map((a) => a.metadata?.uid);
    const presentIds = selectedIDs.filter((id) => allIds.includes(id));
    if (presentIds.length !== selectedIDs.length) {
      void setFieldValue(presentIds);
    }
  }, [matchingAgents, setFieldValue, selectedIDs]);

  const onSelect = React.useCallback(
    (agent: AgentK8sResource, selected: boolean) => {
      const newIDs = selected
        ? [...idsRef.current, agent.metadata?.uid || '']
        : idsRef.current.filter((uid: string) => uid !== agent.metadata?.uid);
      void setFieldValue(newIDs);
      onHostSelect?.();
    },
    [setFieldValue, onHostSelect],
  );

  const [hosts, actions, actionResolver] = useAgentsTable(
    { agents: matchingAgents },
    { onSelect, onEditRole, onEditHost },
  );

  const addAll = width && width > 700;

  const content = React.useMemo(() => {
    return [
      agentHostnameColumn(hosts, matchingAgents, [], actions.onEditHost, actions.canEditHostname),
      ...(addAll ? [infraEnvColumn(matchingAgents)] : []),
      agentStatusColumn({
        agents: matchingAgents,
        wizardStepId: 'hosts-selection',
      }),
      roleColumn(actions.canEditRole, actions.onEditRole, undefined, addAll ? 'left' : 'right'),
      ...(addAll ? [cpuCoresColumn, memoryColumn, disksColumn] : []),
    ];
  }, [
    matchingAgents,
    actions.canEditRole,
    actions.onEditRole,
    addAll,
    hosts,
    actions.onEditHost,
    actions.canEditHostname,
  ]);

  const paginationProps = usePagination(hosts.length);

  type ExpandComponentProps = {
    obj: Host;
  };

  const actionChecks = React.useMemo(
    () => ({
      //canEditHostname: () => canEditHostnameUtil(cluster.status),
      onDiskRole: (hostId: string, diskId?: string) => {
        const host = hosts.find((host) => host.id === hostId);
        return onDiskRoleUtil(host, diskId);
      },
    }),
    [actions.onDiskRole],
  );

  const ExpandComponent: React.FC<ExpandComponentProps> = ({ obj }) => (
    <HostDetail host={obj} onDiskRole={actionChecks.onDiskRole} canEditDisks={() => true} />
  );

  return (
    <HostsTable
      hosts={hosts}
      content={content}
      selectedIDs={selectedIDs}
      actionResolver={actionResolver}
      ExpandComponent={ExpandComponent}
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
