import * as React from 'react';
import { expandable, IRowData, sortable } from '@patternfly/react-table';
import {
  getDateTimeCell,
  getHostname,
  getHostRole,
  Host,
  HostsTable,
  HostsTableActions,
  HostsTableProps,
  RoleCell,
} from '../../../common';
import { AdditionalNTPSourcesDialogToggle } from '../../../ocm/components/hosts/AdditionaNTPSourceDialogToggle';
import { AgentK8sResource } from '../../types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import { getAIHosts } from '../helpers';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';
import { ConnectedIcon } from '@patternfly/react-icons';
import AgentStatus from './AgentStatus';
import Hostname from '../../../common/components/hosts/Hostname';
import HostPropertyValidationPopover from '../../../common/components/hosts/HostPropertyValidationPopover';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { getHostRowHardwareInfo } from '../../../common/components/hosts/hardwareInfo';

type GetAgentCallback = <R>(
  agentCallback: ((agent: AgentK8sResource) => R) | undefined,
  agents: AgentK8sResource[],
) => ((host: Host) => R) | undefined;

const getAgentCallback: GetAgentCallback = (agentCallback, agents) =>
  agentCallback
    ? (host) => {
        const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
        return agentCallback(agent);
      }
    : undefined;

export const useAgentTableActions = ({
  onDeleteHost,
  onEditRole,
  onEditHost,
  canDelete,
  canEditHost,
  canEditRole,
  onApprove,
  agents,
}: ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
}): HostsTableActions =>
  React.useMemo(
    () => ({
      onDeleteHost: onDeleteHost
        ? (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
            const agent = agents.find(
              (a) => a.metadata?.uid === rowData.host.id,
            ) as AgentK8sResource;
            onDeleteHost(agent);
          }
        : undefined,
      onEditRole: onEditRole
        ? (host: Host, role: string | undefined) => {
            const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
            return onEditRole(agent, role);
          }
        : undefined,
      onEditHost: getAgentCallback(onEditHost, agents),
      canDelete: getAgentCallback(canDelete, agents),
      canEditHost: getAgentCallback(canEditHost, agents),
      canEditRole: getAgentCallback(canEditRole, agents),
      onApprove: getAgentCallback(onApprove, agents),
    }),
    [onDeleteHost, onEditHost, onEditRole, canDelete, canEditHost, canEditRole, onApprove, agents],
  );

const defaultColumns = [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Discovered At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
  { title: '' },
];

const defaultHostToHostTableRow: AgentTableProps['hostToHostTableRow'] = (agents, onApprove) => ({
  openRows,
  onEditHostname,
  onEditRole,
  AdditionalNTPSourcesDialogToggleComponent,
}) => (host) => {
  const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
  const { id, status, createdAt } = host;
  const inventory = agent.status?.inventory || {};
  const { cores, memory, disk } = getHostRowHardwareInfo(inventory);
  const validationsInfo = agent.status?.hostValidationInfo || {};
  const memoryValidation = validationsInfo?.hardware?.find((v) => v.id === 'has-memory-for-role');
  const diskValidation = validationsInfo?.hardware?.find((v) => v.id === 'has-min-valid-disks');
  const cpuCoresValidation = validationsInfo?.hardware?.find(
    (v) => v.id === 'has-cpu-cores-for-role',
  );
  const computedHostname = getHostname(host, inventory);
  const hostRole = getHostRole(host);
  const dateTimeCell = getDateTimeCell(createdAt);

  const editHostname = onEditHostname ? () => onEditHostname(host, inventory) : undefined;
  const editRole = onEditRole ? (role?: string) => onEditRole(host, role) : undefined;

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        {
          title: <Hostname host={host} onEditHostname={editHostname} />,
          props: { 'data-testid': 'host-name' },
          sortableValue: computedHostname || '',
        },
        {
          title: <RoleCell host={host} readonly={false} role={hostRole} onEditRole={editRole} />,
          props: { 'data-testid': 'host-role' },
          sortableValue: hostRole,
        },
        {
          title: <AgentStatus agent={agent} onApprove={onApprove} onEditHostname={editHostname} />,
          props: { 'data-testid': 'host-status' },
          sortableValue: status,
        },
        {
          title: dateTimeCell.title,
          props: { 'data-testid': 'host-discovered-time' },
          sortableValue: dateTimeCell.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={cpuCoresValidation}>
              {cores.title}
            </HostPropertyValidationPopover>
          ),
          props: { 'data-testid': 'host-cpu-cores' },
          sortableValue: cores.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={memoryValidation}>
              {memory.title}
            </HostPropertyValidationPopover>
          ),
          props: { 'data-testid': 'host-memory' },
          sortableValue: memory.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={diskValidation}>
              {disk.title}
            </HostPropertyValidationPopover>
          ),
          props: { 'data-testid': 'host-disks' },
          sortableValue: disk.sortableValue,
        },
      ],
      host,
      key: `${host.id}-master`,
    },
    {
      // expandable detail
      // parent will be set after sorting
      fullWidth: true,
      cells: [
        {
          title: (
            <HostDetail
              key={id}
              canEditDisks={() => false}
              inventory={inventory}
              host={host}
              validationsInfo={validationsInfo}
              AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
            />
          ),
        },
      ],
      host,
      key: `${host.id}-detail`,
    },
  ];
};

const AgentTableEmptyState = () => (
  <DefaultEmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Hosts may take a few minutes to appear here after booting."
  />
);

export type AgentTableProps = ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
  className?: string;
  columns?: HostsTableProps['columns'];
  hostToHostTableRow?: (
    agents: AgentK8sResource[],
    onApprove?: ClusterDeploymentHostsTablePropsActions['onApprove'],
  ) => HostsTableProps['hostToHostTableRow'];
  EmptyState?: HostsTableProps['EmptyState'];
};

const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  className,
  columns = defaultColumns,
  hostToHostTableRow = defaultHostToHostTableRow,
  EmptyState = AgentTableEmptyState,
  onApprove,
  ...actions
}) => {
  const tableCallbacks = useAgentTableActions({
    ...actions,
    agents,
  });
  const restHosts = getAIHosts(agents);
  return (
    <HostsTable
      hosts={restHosts}
      EmptyState={EmptyState}
      columns={columns}
      className={className}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      hostToHostTableRow={hostToHostTableRow(agents, onApprove)}
      {...tableCallbacks}
    />
  );
};

export default AgentTable;
