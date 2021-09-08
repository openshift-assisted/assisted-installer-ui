import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { WithTestID, EmptyState } from '../../../common';
import { ClusterDeploymentHostsTablePropsActions } from './types';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { getAICluster } from '../helpers';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';
import NetworkConfigurationTable from '../../../common/components/clusterConfiguration/NetworkConfigurationTable';
import { useAgentsTable } from '../Agent/tableUtils';

type ClusterDeploymentHostsTableProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  skipDisabled?: boolean;
  hostActions: ClusterDeploymentHostsTablePropsActions;
  selectedHostIds?: string[];
} & WithTestID;

const ClusterDeploymentHostsTable: React.FC<ClusterDeploymentHostsTableProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  selectedHostIds,
  hostActions,
}) => {
  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });

  const [, agentActions, actionResolver] = useAgentsTable(hostActions, agents);

  const AdditionalNTPSourcesDialogToggleWithCluster = React.useCallback<React.FC>(
    () => <AdditionalNTPSourcesDialogToggle cluster={cluster} />,
    [cluster],
  );

  return (
    <NetworkConfigurationTable
      cluster={cluster}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleWithCluster}
      actionResolver={actionResolver}
      selectedIDs={selectedHostIds}
      {...agentActions}
    >
      <EmptyState
        icon={ConnectedIcon}
        title="Waiting for hosts..."
        content="Hosts may take a few minutes to appear here after booting."
      />
    </NetworkConfigurationTable>
  );
};

export default ClusterDeploymentHostsTable;
