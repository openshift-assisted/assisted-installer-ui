import * as React from 'react';
import noop from 'lodash/noop';

import { Host } from '../../../common/api/types';
import { discoveryTypeColumn, agentStatusColumn, useAgentsTable } from '../Agent/tableUtils';
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
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import MassApproveAgentModal from '../modals/MassApproveAgentModal';
import { AgentK8sResource, BareMetalHostK8sResource, InfraEnvK8sResource } from '../../types';
import { MassChangeHostnameModalProps } from '../../../common/components/hosts/MassChangeHostnameModal';
import MassApproveAction from '../modals/MassApproveAction';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { Stack, StackItem } from '@patternfly/react-core';

export type ClusterDeploymentHostDiscoveryTableProps = ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
  bareMetalHosts: BareMetalHostK8sResource[];
  infraEnv: InfraEnvK8sResource;
  className?: string;
  onChangeHostname: (agent: AgentK8sResource, hostname: string) => Promise<AgentK8sResource>;
  onChangeBMHHostname: (
    bmh: BareMetalHostK8sResource,
    hostname: string,
  ) => Promise<BareMetalHostK8sResource>;
  onApprove?: (agents: AgentK8sResource) => Promise<AgentK8sResource>;
};

const ClusterDeploymentHostDiscoveryTable: React.FC<ClusterDeploymentHostDiscoveryTableProps> = ({
  agents,
  className,
  bareMetalHosts,
  infraEnv,
  onApprove,
  onChangeHostname,
  onChangeBMHHostname,
  onEditHost,
  canEditRole,
  onEditRole,
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
    { onEditHost, canEditRole, onEditRole },
  );
  const content = React.useMemo(
    () =>
      [
        hostnameColumn(hostActions.onEditHost),
        discoveryTypeColumn(agents, bareMetalHosts),
        agentStatusColumn({
          agents,
          bareMetalHosts,
          onEditHostname: onEditHost,
          onApprove,
          wizardStepId: 'hosts-discovery',
        }),
        roleColumn(hostActions.canEditRole, hostActions.onEditRole),
        discoveredAtColumn,
        cpuCoresColumn,
        memoryColumn,
        disksColumn,
      ].filter(Boolean),
    [agents, hostActions, bareMetalHosts, onApprove, onEditHost],
  );

  const selectedAgents = agents.filter((a) => selectedHostIDs.includes(a.metadata?.uid || ''));

  const massActions = [
    <ChangeHostnameAction
      key="hostname"
      onChangeHostname={() => setMassChangeHostOpen(!isMassChangeHostOpen)}
    />,
  ];
  if (onApprove) {
    massActions.push(
      <MassApproveAction
        key="approve"
        onApprove={() => setMassApproveOpen(!isMassApproveOpen)}
        selectedAgents={selectedAgents}
      />,
    );
  }

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
            selectedIDs={selectedHostIDs || []}
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
            className={className}
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
        />
      )}
      {onApprove && isMassApproveOpen && (
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
