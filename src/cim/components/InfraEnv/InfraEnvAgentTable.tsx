import * as React from 'react';
import { Button, DropdownItem, Stack, StackItem } from '@patternfly/react-core';
import { noop } from 'lodash';

import { Host } from '../../../common/api/types';
import {
  discoveryTypeColumn,
  agentStatusColumn,
  clusterColumn,
  useAgentsTable,
  useAgentsFilter,
  agentHostnameColumn,
  canEditBMH,
} from '../Agent/tableUtils';
import HostsTable, {
  DefaultExpandComponent,
  HostsTableEmptyState,
} from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  memoryColumn,
} from '../../../common/components/hosts/tableUtils';
import {
  DiscoveryTroubleshootingModal,
  MassChangeHostnameModal,
  DeleteHostAction,
  EmptyState,
} from '../../../common';
import { InfraEnvAgentTableProps } from '../ClusterDeployment/types';
import { MassApproveAgentModal, MassDeleteAgentModal } from '../modals';
import { MassChangeHostnameModalProps } from '../../../common/components/hosts/MassChangeHostnameModal';
import MassApproveAction from '../modals/MassApproveAction';
import { usePagination } from '../../../common/components/hosts/usePagination';
import InfraTableToolbar from './InfraTableToolbar';

type NoFilterMatchStateProps = {
  onClearFilters: VoidFunction;
};

const NoFilterMatchState: React.FC<NoFilterMatchStateProps> = ({ onClearFilters }) => (
  <EmptyState
    title="No results found"
    content="No results match the filter criteria. Clear filters to show results."
    secondaryActions={[
      <Button key="clear-filters" variant="link" onClick={onClearFilters}>
        Clear all filters
      </Button>,
    ]}
  />
);

const InfraEnvAgentTable: React.FC<InfraEnvAgentTableProps> = ({
  agents,
  className,
  getClusterDeploymentLink,
  bareMetalHosts,
  infraEnv,
  onChangeHostname,
  onChangeBMHHostname,
  onMassDeleteHost,
  ...actions
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [isMassChangeHostOpen, setMassChangeHostOpen] = React.useState(false);
  const [isMassApproveOpen, setMassApproveOpen] = React.useState(false);
  const [isMassDeleteOpen, setMassDeleteOpen] = React.useState(false);
  const [selectedHostIDs, setSelectedHostIDs] = React.useState<string[]>([]);

  const selectedIDsRef = React.useRef(selectedHostIDs);
  selectedIDsRef.current = selectedHostIDs;

  const onSelect = React.useCallback((host: Host, isSelected: boolean) => {
    if (isSelected) {
      setSelectedHostIDs([...selectedIDsRef.current, host.id]);
    } else {
      setSelectedHostIDs(selectedIDsRef.current.filter((sa) => sa !== host.id));
    }
  }, []);

  const [allHosts, hostActions, actionResolver] = useAgentsTable(
    {
      agents,
      bmhs: bareMetalHosts,
      infraEnv,
    },
    actions,
  );

  const {
    statusCount,
    hostnameFilter,
    setHostnameFilter,
    setStatusFilter,
    statusFilter,
    filteredHosts: hosts,
  } = useAgentsFilter({ agents, bmhs: bareMetalHosts, hosts: allHosts });

  const content = React.useMemo(
    () =>
      [
        agentHostnameColumn(
          hosts,
          agents,
          bareMetalHosts,
          hostActions.onEditHost,
          hostActions.canEditHostname,
          hostActions.canEditBMH,
        ),
        discoveryTypeColumn(agents, bareMetalHosts),
        agentStatusColumn({
          agents,
          bareMetalHosts,
          onEditHostname: actions.onEditHost,
          onApprove: actions.onApprove,
        }),
        clusterColumn(agents, getClusterDeploymentLink),
        discoveredAtColumn,
        cpuCoresColumn,
        memoryColumn,
        disksColumn,
      ].filter(Boolean),
    [
      hosts,
      agents,
      actions.onEditHost,
      actions.onApprove,
      getClusterDeploymentLink,
      hostActions,
      bareMetalHosts,
    ],
  );

  const selectedAgents = agents.filter((a) => selectedHostIDs.includes(a.metadata?.uid || ''));
  const selectedBMHs = bareMetalHosts.filter((bmh) =>
    selectedHostIDs.includes(bmh.metadata?.uid || ''),
  );

  const canChangeHostname = (h: Host): string | undefined => {
    const agent = agents.find((a) => a.metadata?.uid === h.id);
    if (agent && actions.canEditHost) {
      return actions.canEditHost(agent) ? undefined : 'Hostname cannot be changed anymore.';
    }
    const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === h.id);
    if (bmh) {
      return canEditBMH(bmh);
    }
    return undefined;
  };

  const canEditHostname =
    selectedBMHs.every(canEditBMH) &&
    selectedAgents.every((a) => (actions.canEditHost ? !actions.canEditHost(a) : undefined));

  const massActions = [
    <DropdownItem
      key="hostname"
      onClick={() => setMassChangeHostOpen(!isMassChangeHostOpen)}
      isDisabled={canEditHostname}
      description={canEditHostname ? 'Hostname cannot be changed for selected hosts.' : undefined}
    >
      Change hostname
    </DropdownItem>,
    ...(actions.onApprove
      ? [
          <MassApproveAction
            key="approve"
            onApprove={() => setMassApproveOpen(!isMassApproveOpen)}
            selectedAgents={selectedAgents}
          />,
        ]
      : []),
    ...(onMassDeleteHost
      ? [
          <DeleteHostAction
            key="delete"
            onDeleteHost={() => setMassDeleteOpen(!isMassDeleteOpen)}
          />,
        ]
      : []),
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

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <InfraTableToolbar
            hosts={hosts}
            setSelectedHostIDs={setSelectedHostIDs}
            massActions={massActions}
            statusCount={statusCount}
            hostnameFilter={hostnameFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedHostIDs={selectedHostIDs}
            setHostnameFilter={setHostnameFilter}
            {...paginationProps}
          />
        </StackItem>
        <StackItem>
          <HostsTable
            hosts={hosts}
            content={content}
            actionResolver={actionResolver}
            className={className}
            selectedIDs={selectedHostIDs}
            setSelectedHostIDs={setSelectedHostIDs}
            onSelect={onSelect}
            ExpandComponent={DefaultExpandComponent}
            {...paginationProps}
          >
            {allHosts.length !== hosts.length ? (
              <NoFilterMatchState
                onClearFilters={() => {
                  setHostnameFilter(undefined);
                  setStatusFilter([]);
                }}
              />
            ) : (
              <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
            )}
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
          canChangeHostName={canChangeHostname}
        />
      )}
      {onMassDeleteHost && isMassDeleteOpen && (
        <MassDeleteAgentModal
          isOpen={isMassDeleteOpen}
          agents={selectedAgents}
          bmhs={selectedBMHs}
          infraEnv={infraEnv}
          onDelete={onMassDeleteHost}
          onClose={() => setMassDeleteOpen(false)}
        />
      )}
      {actions.onApprove && isMassApproveOpen && (
        <MassApproveAgentModal
          isOpen={isMassApproveOpen}
          agents={selectedAgents}
          onApprove={actions.onApprove}
          onClose={() => setMassApproveOpen(false)}
        />
      )}
    </>
  );
};

export default InfraEnvAgentTable;
