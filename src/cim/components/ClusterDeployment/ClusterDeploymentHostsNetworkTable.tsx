import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { WithTestID, EmptyState } from '../../../common';
import { ClusterDeploymentHostsTablePropsActions } from './types';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { getAICluster, getIsSNOCluster } from '../helpers';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';
import { networkingStatusColumn, useAgentsTable } from '../Agent/tableUtils';
import HostsTable from '../../../common/components/hosts/HostsTable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import {
  activeNICColumn,
  hostnameColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';

type ClusterDeploymentHostsNetworkTableProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  skipDisabled?: boolean;
  hostActions: ClusterDeploymentHostsTablePropsActions;
} & WithTestID;

const ClusterDeploymentHostsNetworkTable: React.FC<ClusterDeploymentHostsNetworkTableProps> = React.memo(
  ({ clusterDeployment, agentClusterInstall, agents, hostActions }) => {
    const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });
    const [hosts, { onEditHost, canEditRole, onEditRole }, actionResolver] = useAgentsTable(
      { agents },
      hostActions,
    );

    const isSNOCluster = getIsSNOCluster(agentClusterInstall);
    const content = React.useMemo(
      () =>
        isSNOCluster
          ? [
              hostnameColumn(onEditHost, hosts),
              networkingStatusColumn(onEditHost),
              activeNICColumn(cluster),
            ]
          : [
              hostnameColumn(onEditHost, hosts),
              roleColumn(canEditRole, onEditRole),
              networkingStatusColumn(onEditHost),
              activeNICColumn(cluster),
            ],
      [onEditHost, onEditRole, canEditRole, cluster, isSNOCluster, hosts],
    );

    return (
      <HostsTable
        testId="networking-host-table"
        hosts={hosts}
        ExpandComponent={({ obj }) => {
          return (
            <HostDetail
              host={obj}
              AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
            />
          );
        }}
        content={content}
        actionResolver={actionResolver}
      >
        <EmptyState
          icon={ConnectedIcon}
          title="Waiting for hosts..."
          content="Hosts may take a few minutes to appear here after booting."
        />
      </HostsTable>
    );
  },
);

export default ClusterDeploymentHostsNetworkTable;
