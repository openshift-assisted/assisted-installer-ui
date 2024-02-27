import * as React from 'react';
import { Button, DropdownItem, Stack, StackItem } from '@patternfly/react-core';
import noop from 'lodash-es/noop.js';

import { Host } from '@openshift-assisted/types/assisted-installer-service';
import {
  discoveryTypeColumn,
  agentStatusColumn,
  clusterColumn,
  useAgentsTable,
  useAgentsFilter,
  agentHostnameColumn,
  canEditBMH,
  canEditAgent,
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
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { agentStatus, bmhStatus } from '../helpers/agentStatus';

type NoFilterMatchStateProps = {
  onClearFilters: VoidFunction;
};

const NoFilterMatchState: React.FC<NoFilterMatchStateProps> = ({ onClearFilters }) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('ai:No results found')}
      content={t('ai:No results match the filter criteria. Clear filters to show results.')}
      secondaryActions={[
        <Button key="clear-filters" variant="link" onClick={onClearFilters}>
          {t('ai:Clear all filters')}
        </Button>,
      ]}
    />
  );
};

const InfraEnvAgentTable: React.FC<InfraEnvAgentTableProps> = ({
  agents,
  agentMachines,
  getClusterDeploymentLink,
  bareMetalHosts,
  infraEnv,
  nmStates,
  onChangeHostname,
  onChangeBMHHostname,
  onMassDeleteHost,
  agentClusterInstalls,
  onApprove,
  onDeleteHost,
  onEditBMH,
  onEditHost,
  onUnbindHost,
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
      agentClusterInstalls,
    },
    {
      onApprove,
      onDeleteHost,
      onEditBMH,
      onEditHost,
      onUnbindHost,
    },
  );
  const { t } = useTranslation();
  const { agentStatuses, bmhStatuses } = React.useMemo(
    () => ({
      agentStatuses: agentStatus(t),
      bmhStatuses: bmhStatus(t),
    }),
    [t],
  );

  const {
    statusCount,
    hostnameFilter,
    setHostnameFilter,
    setStatusFilter,
    statusFilter,
    filteredHosts: hosts,
  } = useAgentsFilter({
    agents,
    agentStatuses,
    bmhs: bareMetalHosts,
    bmhStatuses,
    hosts: allHosts,
  });

  const content = React.useMemo(
    () =>
      [
        agentHostnameColumn(
          t,
          hosts,
          agents,
          bareMetalHosts,
          hostActions.onEditHost,
          hostActions.canEditHostname,
          hostActions.canEditBMH,
        ),
        discoveryTypeColumn(agents, bareMetalHosts, t),
        agentStatusColumn({
          agents,
          agentStatuses,
          bareMetalHosts,
          bmhStatuses,
          onEditHostname: onEditHost,
          onApprove: onApprove,
          t,
        }),
        clusterColumn(agents, agentMachines, getClusterDeploymentLink, t),
        discoveredAtColumn(t),
        cpuCoresColumn(t),
        memoryColumn(t),
        disksColumn(t),
      ].filter(Boolean),
    [
      t,
      hosts,
      agents,
      bareMetalHosts,
      hostActions.onEditHost,
      hostActions.canEditHostname,
      hostActions.canEditBMH,
      agentStatuses,
      bmhStatuses,
      onEditHost,
      onApprove,
      agentMachines,
      getClusterDeploymentLink,
    ],
  );

  const selectedAgents = agents.filter((a) => selectedHostIDs.includes(a.metadata?.uid || ''));
  const selectedBMHs = bareMetalHosts.filter((bmh) =>
    selectedHostIDs.includes(bmh.metadata?.uid || ''),
  );

  const canEditHostname =
    selectedBMHs.some((bmh) => canEditBMH(bmh, t)[0]) ||
    selectedAgents.some((a) => canEditAgent(a, agentStatuses, t)[0]);

  const massActions = [
    <DropdownItem
      key="hostname"
      onClick={() => setMassChangeHostOpen(!isMassChangeHostOpen)}
      isDisabled={!canEditHostname}
      description={
        canEditHostname ? undefined : t('ai:Hostname cannot be changed for selected hosts.')
      }
    >
      {t('ai:Change hostname')}
    </DropdownItem>,
    <MassApproveAction
      key="approve"
      onApprove={() => setMassApproveOpen(!isMassApproveOpen)}
      selectedAgents={selectedAgents}
    />,
    <DeleteHostAction key="delete" onDeleteHost={() => setMassDeleteOpen(!isMassDeleteOpen)} />,
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
            selectedIDs={selectedHostIDs}
            setSelectedIDs={setSelectedHostIDs}
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
          canChangeHostname={canChangeHostname(agents, agentStatuses, bareMetalHosts, t)}
        />
      )}
      {isMassDeleteOpen && (
        <MassDeleteAgentModal
          isOpen={isMassDeleteOpen}
          agents={selectedAgents}
          bmhs={selectedBMHs}
          infraEnv={infraEnv}
          nmStates={nmStates}
          onDelete={onMassDeleteHost}
          onClose={() => setMassDeleteOpen(false)}
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

export default InfraEnvAgentTable;
