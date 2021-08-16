import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { WithTestID, EmptyState, HostsTable } from '../../../common';
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
import { useAgentTableActions } from '../Agent/AgentTable';

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
  hostActions: ClusterDeploymentHostsTablePropsActions;
} & WithTestID;

const ClusterDeploymentHostsTable: React.FC<ClusterDeploymentHostsTableProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  pullSecretSet,
  hostActions,
}) => {
  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents, pullSecretSet });

  const tableCallbacks = useAgentTableActions({
    ...hostActions,
    agents,
  });

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
