import * as React from 'react';
import { expandable, sortable } from '@patternfly/react-table';
import { getDateTimeCell, getHostname } from '../../../common';
import { AgentK8sResource } from '../../types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import { getHostRowHardwareInfo } from '../../../common/components/hosts/hardwareInfo';
import Hostname from '../../../common/components/hosts/Hostname';
import HostPropertyValidationPopover from '../../../common/components/hosts/HostPropertyValidationPopover';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { Link } from 'react-router-dom';
import { AgentTable } from '../Agent';
import { AgentTableProps } from '../Agent/AgentTable';
import AgentStatus from '../Agent/AgentStatus';

const columns = [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Discovery type', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Cluster', transforms: [sortable] },
  { title: 'Discovered At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
  { title: '' },
];

const hostToHostTableRow = (
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string,
  agents: AgentK8sResource[],
  onApprove: ClusterDeploymentHostsTablePropsActions['onApprove'],
): AgentTableProps['hostToHostTableRow'] => ({
  openRows,
  AdditionalNTPSourcesDialogToggleComponent,
  canEditDisks,
  onEditHostname,
  onDiskRole,
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
  const dateTimeCell = getDateTimeCell(createdAt);

  const editHostname = onEditHostname ? () => onEditHostname(host, inventory) : undefined;
  const discoveryType = agent?.metadata?.labels?.hasOwnProperty('agent-install.openshift.io/bmh')
    ? 'Discovery ISO'
    : 'BMC';

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        {
          title: <Hostname host={host} inventory={inventory} onEditHostname={editHostname} />,
          props: { 'data-testid': 'host-name' },
          sortableValue: computedHostname || '',
        },

        {
          title: discoveryType,
          props: { 'data-testid': 'discovery-type' },
          sortableValue: discoveryType,
        },
        {
          title: <AgentStatus agent={agent} onApprove={onApprove} onEditHostname={editHostname} />,
          props: { 'data-testid': 'host-status' },
          sortableValue: status,
        },
        {
          title: agent?.spec?.clusterDeploymentName ? (
            <Link to={getClusterDeploymentLink(agent.spec.clusterDeploymentName)}>
              {agent.spec.clusterDeploymentName.name}
            </Link>
          ) : (
            '--'
          ),
          props: { 'data-testid': 'cluster' },
          sortableValue: agent?.spec?.clusterDeploymentName ?? '--',
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
      inventory,
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
              canEditDisks={canEditDisks}
              onDiskRole={onDiskRole}
              inventory={inventory}
              host={host}
              validationsInfo={validationsInfo}
              AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
            />
          ),
        },
      ],
      key: `${host.id}-detail`,
      inventory,
    },
  ];
};

type InfraEnvAgentTable = ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string;
  className?: string;
};

const InfraEnvAgentTable: React.FC<InfraEnvAgentTable> = ({
  agents,
  getClusterDeploymentLink,
  className,
  onApprove,
  ...actions
}) => {
  return (
    <AgentTable
      agents={agents}
      columns={columns}
      className={className}
      hostToHostTableRow={hostToHostTableRow(getClusterDeploymentLink, agents, onApprove)}
      {...actions}
    />
  );
};

export default InfraEnvAgentTable;
