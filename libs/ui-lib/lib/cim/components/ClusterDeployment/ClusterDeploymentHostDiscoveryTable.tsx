import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import {
  discoveryTypeColumn,
  agentStatusColumn,
  useAgentsTable,
  canChangeHostname,
} from '../Agent/tableUtils';
import HostsTable, {
  DefaultExpandComponent,
  HostsTableEmptyState,
} from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import {
  DiscoveryTroubleshootingModal,
  ChangeHostnameAction,
  MassChangeHostnameModal,
  TableToolbar,
} from '../../../common';
import { ClusterDeploymentHostDiscoveryTableProps } from '../ClusterDeployment/types';
import MassApproveAgentModal from '../modals/MassApproveAgentModal';
import MassApproveAction from '../modals/MassApproveAction';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { ExpandComponent } from '../Agent/AgentsSelectionTable';
import { HostsTableDetailContextProvider } from '../../../common/components/hosts/HostsTableDetailContext';
import { agentStatus, bmhStatus } from '../helpers/agentStatus';
import { onAgentChangeHostname } from '../helpers';

const ClusterDeploymentHostDiscoveryTable: React.FC<ClusterDeploymentHostDiscoveryTableProps> = ({
  agents,
  bareMetalHosts,
  infraEnv,
  onApprove,
  onChangeHostname,
  onChangeBMHHostname,
  onEditRole,
  onSetInstallationDiskId,
  onEditHost,
  onEditBMH,
  onDeleteHost,
  width,
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [isMassChangeHostOpen, setMassChangeHostOpen] = React.useState(false);
  const [isMassApproveOpen, setMassApproveOpen] = React.useState(false);
  const [selectedHostIDs, setSelectedHostIDs] = React.useState<string[]>([]);

  const { t } = useTranslation();
  const agentStatuses = agentStatus(t);
  const bmhStatuses = bmhStatus(t);

  const onSelect = (host: Host, isSelected: boolean) => {
    if (isSelected) {
      setSelectedHostIDs([...selectedHostIDs, host.id]);
    } else {
      setSelectedHostIDs(selectedHostIDs.filter((sa) => sa !== host.id));
    }
  };

  const [hosts, hostActions, actionResolver] = useAgentsTable(
    {
      agents,
      bmhs: bareMetalHosts,
      infraEnv,
    },
    { onEditHost, onEditRole, onEditBMH, onDeleteHost, onSetInstallationDiskId },
  );

  const addAll = width && width > 700;

  const content = React.useMemo(
    () => [
      hostnameColumn(t, hostActions.onEditHost),
      ...(addAll ? [discoveryTypeColumn(agents, bareMetalHosts, t)] : []),
      agentStatusColumn({
        agents,
        agentStatuses,
        bareMetalHosts,
        bmhStatuses,
        onEditHostname: onEditHost,
        onApprove,
        wizardStepId: 'hosts-discovery',
        t,
      }),
      roleColumn(t, hostActions.canEditRole, hostActions.onEditRole),
      ...(addAll
        ? [discoveredAtColumn(t), cpuCoresColumn(t), memoryColumn(t), disksColumn(t)]
        : []),
    ],
    [
      t,
      hostActions.onEditHost,
      hostActions.canEditRole,
      hostActions.onEditRole,
      addAll,
      agents,
      bareMetalHosts,
      agentStatuses,
      bmhStatuses,
      onEditHost,
      onApprove,
    ],
  );

  const selectedAgents = agents.filter((a) => selectedHostIDs.includes(a.metadata?.uid || ''));

  const massActions = [
    <ChangeHostnameAction
      key="hostname"
      onChangeHostname={() => setMassChangeHostOpen(!isMassChangeHostOpen)}
    />,
    <MassApproveAction
      key="approve"
      onApprove={() => setMassApproveOpen(!isMassApproveOpen)}
      selectedAgents={selectedAgents}
    />,
  ];

  const paginationProps = usePagination(hosts.length);
  const itemIDs = hosts.map((h) => h.id);

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <TableToolbar
            selectedIDs={selectedHostIDs}
            itemIDs={itemIDs}
            setSelectedIDs={setSelectedHostIDs}
            actions={massActions}
            {...paginationProps}
          />
        </StackItem>
        <StackItem>
          <HostsTableDetailContextProvider
            canEditDisks={hostActions.canEditDisks}
            onDiskRole={hostActions.onDiskRole}
          >
            <HostsTable
              hosts={hosts}
              content={content}
              actionResolver={actionResolver}
              selectedIDs={selectedHostIDs}
              setSelectedIDs={setSelectedHostIDs}
              onSelect={onSelect}
              ExpandComponent={hostActions.onDiskRole ? ExpandComponent : DefaultExpandComponent}
              {...paginationProps}
            >
              <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
            </HostsTable>
          </HostsTableDetailContextProvider>
        </StackItem>
      </Stack>
      {isDiscoveryHintModalOpen && (
        <DiscoveryTroubleshootingModal
          isOpen={isDiscoveryHintModalOpen}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
      )}
      {isMassChangeHostOpen && (
        <MassChangeHostnameModal
          isOpen={isMassChangeHostOpen}
          hosts={hosts}
          selectedHostIDs={selectedHostIDs}
          onChangeHostname={onAgentChangeHostname(
            agents,
            bareMetalHosts,
            onChangeHostname,
            onChangeBMHHostname,
          )}
          onClose={() => setMassChangeHostOpen(false)}
          canChangeHostname={canChangeHostname(agents, agentStatuses, bareMetalHosts, t)}
        />
      )}
      {isMassApproveOpen && (
        <MassApproveAgentModal
          isOpen={isMassApproveOpen}
          agents={selectedAgents}
          onApprove={onApprove}
          onClose={() => setMassApproveOpen(false)}
        />
      )}
    </>
  );
};

export default ClusterDeploymentHostDiscoveryTable;
