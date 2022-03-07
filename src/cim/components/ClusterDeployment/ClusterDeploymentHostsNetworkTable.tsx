import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { WithTestID, EmptyState, Host } from '../../../common';
import { ClusterDeploymentHostsTablePropsActions } from './types';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { getAICluster, getIsSNOCluster } from '../helpers';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';
import { agentStatusColumn, useAgentsTable } from '../Agent/tableUtils';
import HostsTable from '../../../common/components/hosts/HostsTable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import {
  activeNICColumn,
  hostnameColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import { usePagination } from '../../../common/components/hosts/usePagination';

type ExpandComponentProps = {
  obj: Host;
};

const ExpandComponent: React.FC<ExpandComponentProps> = ({ obj }) => (
  <HostDetail
    host={obj}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);

type ClusterDeploymentHostsNetworkTableProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  skipDisabled?: boolean;
  hostActions: ClusterDeploymentHostsTablePropsActions;
} & WithTestID;

const ClusterDeploymentHostsNetworkTable: React.FC<ClusterDeploymentHostsNetworkTableProps> = React.memo(
  ({ clusterDeployment, agentClusterInstall, agents, hostActions }) => {
    const cluster = React.useMemo(
      () => getAICluster({ clusterDeployment, agentClusterInstall, agents }),
      [clusterDeployment, agentClusterInstall, agents],
    );
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
              agentStatusColumn({
                agents,
                onEditHostname: hostActions.onEditHost,
                wizardStepId: 'networking',
              }),
              activeNICColumn(cluster),
            ]
          : [
              hostnameColumn(onEditHost, hosts),
              roleColumn(canEditRole, onEditRole),
              agentStatusColumn({
                agents,
                onEditHostname: hostActions.onEditHost,
                wizardStepId: 'networking',
              }),
              activeNICColumn(cluster),
            ],
      [
        canEditRole,
        onEditRole,
        isSNOCluster,
        onEditHost,
        hosts,
        agents,
        hostActions.onEditHost,
        cluster,
      ],
    );

    const paginationProps = usePagination(hosts.length);

    return (
      <HostsTable
        testId="networking-host-table"
        hosts={hosts}
        ExpandComponent={ExpandComponent}
        content={content}
        actionResolver={actionResolver}
        {...paginationProps}
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
