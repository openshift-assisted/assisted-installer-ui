import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { EmptyState, Host } from '../../../common';
import { AgentTableActions } from './types';
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
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ExpandComponentProps = {
  obj: Host;
};

const ExpandComponent: React.FC<ExpandComponentProps> = ({ obj }) => (
  <HostDetail
    host={obj}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);

type ClusterDeploymentHostsNetworkTableProps = Pick<
  AgentTableActions,
  'onEditHost' | 'onEditRole'
> & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
};

const ClusterDeploymentHostsNetworkTable: React.FC<ClusterDeploymentHostsNetworkTableProps> =
  // eslint-disable-next-line react/display-name
  React.memo(({ clusterDeployment, agentClusterInstall, agents, onEditHost, onEditRole }) => {
    const { t } = useTranslation();
    const cluster = React.useMemo(
      () => getAICluster({ clusterDeployment, agentClusterInstall, agents }),
      [clusterDeployment, agentClusterInstall, agents],
    );
    const [hosts, hostActions, actionResolver] = useAgentsTable(
      { agents },
      {
        onEditHost,
        onEditRole,
      },
    );

    const isSNOCluster = getIsSNOCluster(agentClusterInstall);
    const content = React.useMemo(
      () =>
        isSNOCluster
          ? [
              hostnameColumn(t, hostActions.onEditHost, hosts),
              agentStatusColumn({
                agents,
                onEditHostname: onEditHost,
                wizardStepId: 'networking',
                t,
              }),
              activeNICColumn(cluster),
            ]
          : [
              hostnameColumn(t, hostActions.onEditHost, hosts),
              roleColumn(t, hostActions.canEditRole, hostActions.onEditRole),
              agentStatusColumn({
                agents,
                onEditHostname: onEditHost,
                wizardStepId: 'networking',
                t,
              }),
              activeNICColumn(cluster),
            ],
      [isSNOCluster, onEditHost, hosts, agents, hostActions, cluster, t],
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
          title={t('ai:Waiting for hosts...')}
          content={t('ai:Hosts may take a few minutes to appear here after booting.')}
        />
      </HostsTable>
    );
  });

export default ClusterDeploymentHostsNetworkTable;
