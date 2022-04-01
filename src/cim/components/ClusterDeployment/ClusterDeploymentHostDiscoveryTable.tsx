import * as React from 'react';
import { noop } from 'lodash';
import { Stack, StackItem } from '@patternfly/react-core';

import { Host } from '../../../common/api/types';
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
import { MassChangeHostnameModalProps } from '../../../common/components/hosts/MassChangeHostnameModal';
import MassApproveAction from '../modals/MassApproveAction';
import { usePagination } from '../../../common/components/hosts/usePagination';

const ClusterDeploymentHostDiscoveryTable: React.FC<ClusterDeploymentHostDiscoveryTableProps> = ({
  agents,
  bareMetalHosts,
  infraEnv,
  onApprove,
  onChangeHostname,
  onChangeBMHHostname,
  onEditRole,
  onEditHost,
  onEditBMH,
  onDeleteHost,
  width,
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [isMassChangeHostOpen, setMassChangeHostOpen] = React.useState(false);
  const [isMassApproveOpen, setMassApproveOpen] = React.useState(false);
  const [selectedHostIDs, setSelectedHostIDs] = React.useState<string[]>([]);

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
    { onEditHost, onEditRole, onEditBMH, onDeleteHost },
  );

  const addAll = width && width > 700;

  const content = React.useMemo(
    () => [
      hostnameColumn(hostActions.onEditHost),
      ...(addAll ? [discoveryTypeColumn(agents, bareMetalHosts)] : []),
      agentStatusColumn({
        agents,
        bareMetalHosts,
        onEditHostname: onEditHost,
        onApprove,
        wizardStepId: 'hosts-discovery',
      }),
      roleColumn(hostActions.canEditRole, hostActions.onEditRole),
      ...(addAll ? [discoveredAtColumn, cpuCoresColumn, memoryColumn, disksColumn] : []),
    ],
    [agents, hostActions, bareMetalHosts, onApprove, onEditHost, addAll],
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

  const onAgentChangeHostname: MassChangeHostnameModalProps['onChangeHostname'] = async (
    host,
    hostname,
  ) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id);
    if (agent) {
      return onChangeHostname(agent, hostname);
    } else {
      const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === host.id);
      return bmh ? onChangeBMHHostname(bmh, hostname) : noop;
    }
  };

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
          <HostsTable
            hosts={hosts}
            content={content}
            actionResolver={actionResolver}
            selectedIDs={selectedHostIDs}
            setSelectedHostIDs={setSelectedHostIDs}
            onSelect={onSelect}
            ExpandComponent={DefaultExpandComponent}
            {...paginationProps}
          >
            <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
          </HostsTable>
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
          onChangeHostname={onAgentChangeHostname}
          onClose={() => setMassChangeHostOpen(false)}
          canChangeHostname={canChangeHostname(agents, bareMetalHosts)}
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
