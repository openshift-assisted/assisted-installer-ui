import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { IRowData } from '@patternfly/react-table';
import { WithTestID, EmptyState, HostsTable, Host } from '../../../common';
import { ClusterDeploymentHostsTablePropsActions } from './types';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { getAICluster } from '../helpers';
import NetworkingStatus from './NetworkingStatus';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';
import {
  getColumns,
  hostToHostTableRow,
} from '../../../common/components/hosts/networking-hosts-table';

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

const HostsTableEmptyState: React.FC<{}> = () => (
  <EmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Hosts may take a few minutes to appear here after booting."
  />
);

type ClusterDeploymentHostsTableProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  pullSecretSet: boolean;
  skipDisabled?: boolean;
} & ClusterDeploymentHostsTablePropsActions &
  WithTestID;

const ClusterDeploymentHostsTable: React.FC<ClusterDeploymentHostsTableProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  pullSecretSet,
  onDeleteHost,
  onEditHost,
  onEditRole,
  canDelete,
  canEditHost,
  canEditRole,
}) => {
  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents, pullSecretSet });

  const tableCallbacks = React.useMemo(
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
    }),
    [onDeleteHost, onEditHost, onEditRole, canDelete, canEditHost, canEditRole, agents],
  );

  const AdditionalNTPSourcesDialogToggleWithCluster = React.useCallback<React.FC>(
    () => <AdditionalNTPSourcesDialogToggle cluster={cluster} />,
    [cluster],
  );

  return (
    <HostsTable
      columns={getColumns(cluster)}
      hostToHostTableRow={hostToHostTableRow(cluster, NetworkingStatus)}
      hosts={cluster.hosts}
      EmptyState={HostsTableEmptyState}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleWithCluster}
      {...tableCallbacks}
    />
  );
};

export default ClusterDeploymentHostsTable;
