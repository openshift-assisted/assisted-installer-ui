import React from 'react';
import { useField } from 'formik';
import HostsTable, { DefaultExpandComponent } from '../../../common/components/hosts/HostsTable';
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
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import { Host } from '../../../common/api/types';
import {
  HostsTableDetailContextProvider,
  useHostsTableDetailContext,
} from '../../../common/components/hosts/HostsTableDetailContext';

export function ExpandComponent({ obj: host }: ExpandComponentProps<Host>) {
  const { onDiskRole, canEditDisks } = useHostsTableDetailContext();
  return (
    <HostDetail key={host.id} host={host} onDiskRole={onDiskRole} canEditDisks={canEditDisks} />
  );
}

type AgentsSelectionTableProps = {
  matchingAgents: AgentK8sResource[];
  width?: number;
  onEditRole?: AgentTableActions['onEditRole'];
  onSetInstallationDiskId?: AgentTableActions['onSetInstallationDiskId'];
  onEditHost?: AgentTableActions['onEditHost'];
  onHostSelect?: VoidFunction;
};

const AgentsSelectionTable: React.FC<AgentsSelectionTableProps> = ({
  matchingAgents,
  onEditRole,
  width,
  onEditHost,
  onHostSelect,
  onSetInstallationDiskId,
}) => {
  const { t } = useTranslation();
  const [{ value: selectedIDs }] =
    useField<ClusterDeploymentHostsSelectionValues['selectedHostIds']>('selectedHostIds');

  const idsRef = React.useRef(selectedIDs);
  idsRef.current = selectedIDs;

  const { setValue, setTouched } =
    useFormikHelpers<ClusterDeploymentHostsSelectionValues['selectedHostIds']>('selectedHostIds');

  const setFieldValue = React.useCallback(
    (ids: string[]) => {
      setValue(ids, true);
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
    { onSelect, onEditRole, onEditHost, onSetInstallationDiskId },
  );

  const addAll = width && width > 700;

  const content = React.useMemo(() => {
    return [
      agentHostnameColumn(hosts, matchingAgents, [], actions.onEditHost, actions.canEditHostname),
      ...(addAll ? [infraEnvColumn(matchingAgents, t)] : []),
      agentStatusColumn({
        agents: matchingAgents,
        wizardStepId: 'hosts-selection',
        t,
      }),
      roleColumn(t, actions.canEditRole, actions.onEditRole, undefined, undefined),
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
    t,
  ]);

  const paginationProps = usePagination(hosts.length);
  return (
    <HostsTableDetailContextProvider
      canEditDisks={actions.canEditDisks}
      onDiskRole={actions.onDiskRole}
    >
      <HostsTable
        hosts={hosts}
        content={content}
        selectedIDs={selectedIDs}
        actionResolver={actionResolver}
        ExpandComponent={actions.onDiskRole ? ExpandComponent : DefaultExpandComponent}
        {...actions}
        {...paginationProps}
      >
        <DefaultEmptyState
          title={t('ai:No hosts found')}
          content={t('ai:No host matches provided labels/locations')}
        />
      </HostsTable>
    </HostsTableDetailContextProvider>
  );
};

export default AgentsSelectionTable;
