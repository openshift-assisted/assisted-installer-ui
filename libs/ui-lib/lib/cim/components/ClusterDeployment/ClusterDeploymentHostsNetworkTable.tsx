import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { EmptyState } from '../../../common';
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
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { agentStatus } from '../helpers/agentStatus';

type ExpandComponentContextType = {
  onSetInstallationDiskId?: ClusterDeploymentHostsNetworkTableProps['onSetInstallationDiskId'];
  agents: AgentK8sResource[];
};

const ExpandComponentContext = React.createContext<ExpandComponentContextType>({
  onSetInstallationDiskId: undefined,
  agents: [],
});

type ExpandComponentProps = {
  obj: Host;
};

const ExpandComponent: React.FC<ExpandComponentProps> = ({ obj }) => {
  const { onSetInstallationDiskId, agents } =
    React.useContext<ExpandComponentContextType>(ExpandComponentContext);

  return (
    <HostDetail
      host={obj}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      canEditDisks={() => true}
      onDiskRole={
        onSetInstallationDiskId
          ? async (hostID, diskID, role) => {
              const agent = agents.find((a) => a.metadata?.uid === obj.id);
              if (agent && diskID && role === 'install') {
                await onSetInstallationDiskId?.(agent, diskID);
              }
            }
          : undefined
      }
    />
  );
};

type ClusterDeploymentHostsNetworkTableProps = Pick<
  AgentTableActions,
  'onEditHost' | 'onEditRole' | 'onSetInstallationDiskId'
> & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
};

const ClusterDeploymentHostsNetworkTable: React.FC<ClusterDeploymentHostsNetworkTableProps> =
  // eslint-disable-next-line react/display-name
  React.memo(
    ({
      clusterDeployment,
      agentClusterInstall,
      agents,
      onEditHost,
      onEditRole,
      onSetInstallationDiskId,
    }) => {
      const { t } = useTranslation();
      const agentStatuses = agentStatus(t);
      const cluster = React.useMemo(
        () => getAICluster({ clusterDeployment, agentClusterInstall, agents }),
        [clusterDeployment, agentClusterInstall, agents],
      );
      const [hosts, hostActions, actionResolver] = useAgentsTable(
        { agents },
        {
          onEditHost,
          onEditRole,
          onSetInstallationDiskId,
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
                  agentStatuses,
                  onEditHostname: onEditHost,
                  wizardStepId: 'networking',
                  t,
                }),
                activeNICColumn(cluster, t),
              ]
            : [
                hostnameColumn(t, hostActions.onEditHost, hosts),
                roleColumn(t, hostActions.canEditRole, hostActions.onEditRole),
                agentStatusColumn({
                  agents,
                  agentStatuses,
                  onEditHostname: onEditHost,
                  wizardStepId: 'networking',
                  t,
                }),
                activeNICColumn(cluster, t),
              ],
        [
          isSNOCluster,
          t,
          hostActions.onEditHost,
          hostActions.canEditRole,
          hostActions.onEditRole,
          hosts,
          agents,
          agentStatuses,
          onEditHost,
          cluster,
        ],
      );

      const paginationProps = usePagination(hosts.length);
      return (
        <ExpandComponentContext.Provider value={{ onSetInstallationDiskId, agents }}>
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
        </ExpandComponentContext.Provider>
      );
    },
  );

export default ClusterDeploymentHostsNetworkTable;
