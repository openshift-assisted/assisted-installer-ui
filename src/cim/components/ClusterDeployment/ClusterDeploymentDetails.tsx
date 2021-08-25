import React from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { sortable, expandable } from '@patternfly/react-table';
import ValidatedConditionAlert from '../common/ValidatedConditionAlert';
import { getClusterValidatedCondition } from '../helpers/conditions';
import { HostsTable } from '../../../common/components/hosts/HostsTable';
import ClusterPropertiesList from '../../../common/components/clusterDetail/ClusterPropertiesList';
import { getAICluster } from '../helpers/toAssisted';
import { getClusterStatus } from '../helpers/status';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentCredentials from './ClusterDeploymentCredentials';
import { AdditionalNTPSourcesDialogToggle } from '../../../ocm/components/hosts/AdditionaNTPSourceDialogToggle';
import ClusterProgress from '../../../common/components/clusterDetail/ClusterProgress';
import ClusterInstallationError from './ClusterInstallationError';
import { EventsModalButton } from '../../../common/components/ui/eventsModal';
import KubeconfigDownload from '../../../common/components/clusterDetail/KubeconfigDownload';
import { EventListFetchProps } from '../../../common/types/events';

const hostsTableColumns = [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Discovered At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
  { title: '' },
];

type ClusterDeploymentDetailsProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  downloadKubeconfig: () => Promise<void>;
  fetchEvents: EventListFetchProps['onFetchEvents'];
  fetchCredentials: (setCredentials: unknown) => Promise<void>;
};

const ClusterDeploymentDetails: React.FC<ClusterDeploymentDetailsProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  downloadKubeconfig,
  fetchEvents,
  fetchCredentials,
}) => {
  const [progressCardExpanded, setProgressCardExpanded] = React.useState(true);
  const [inventoryCardExpanded, setInventoryCardExpanded] = React.useState(true);
  const [detailsCardExpanded, setDetailsCardExpanded] = React.useState(true);

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });
  const [clusterStatus, clusterStatusInfo] = getClusterStatus(agentClusterInstall);
  return (
    <Stack hasGutter>
      {[
        'preparing-for-installation',
        'installing',
        'installing-pending-user-action',
        'finalizing',
        'installed',
        'error',
        'cancelled',
        'adding-hosts',
      ].includes(clusterStatus) && (
        <StackItem>
          <Card id="cluster-installation-progress-card" isExpanded={progressCardExpanded}>
            <CardHeader
              onExpand={() => setProgressCardExpanded(!progressCardExpanded)}
              toggleButtonProps={{
                id: 'progress-card-toggle-button',
                'aria-label': 'Cluster installation process',
                'aria-labelledby': 'titleId progress-card-toggle-button',
                'aria-expanded': progressCardExpanded,
              }}
            >
              <CardTitle id="titleId">Cluster installation process</CardTitle>
            </CardHeader>
            <CardExpandableContent>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <ClusterProgress
                      cluster={cluster}
                      onFetchEvents={async () =>
                        console.log('ClusterProgress - onFetchEvents missing implementation')
                      }
                    />
                  </StackItem>
                  {['installed', 'adding-hosts'].includes(clusterStatus) && (
                    <StackItem>
                      <ClusterDeploymentCredentials
                        cluster={cluster}
                        fetchCredentials={fetchCredentials}
                        consoleUrl={
                          clusterDeployment.status?.webConsoleURL ||
                          `https://console-openshift-console.apps.${clusterDeployment.spec?.clusterName}.${clusterDeployment.spec?.baseDomain}`
                        }
                      />
                    </StackItem>
                  )}
                  <StackItem>
                    <KubeconfigDownload
                      handleDownload={downloadKubeconfig}
                      clusterId={clusterDeployment.metadata?.uid || ''}
                      status={clusterStatus}
                    />{' '}
                    <EventsModalButton
                      id="cluster-events-button"
                      entityKind="cluster"
                      cluster={cluster}
                      title="Cluster Events"
                      variant={ButtonVariant.link}
                      style={{ textAlign: 'right' }}
                      onFetchEvents={fetchEvents}
                      ButtonComponent={Button}
                    >
                      View Cluster Events
                    </EventsModalButton>
                  </StackItem>
                  {['error', 'cancelled'].includes(clusterStatus) && (
                    <StackItem>
                      <ClusterInstallationError
                        title={
                          clusterStatus === 'cancelled'
                            ? 'Cluster installation was cancelled'
                            : undefined
                        }
                        statusInfo={clusterStatusInfo}
                        logsUrl={agentClusterInstall.status?.debugInfo?.logsURL}
                        openshiftVersion={clusterDeployment.status?.installVersion}
                      />
                    </StackItem>
                  )}
                </Stack>
              </CardBody>
            </CardExpandableContent>
          </Card>
        </StackItem>
      )}
      <StackItem>
        <Card id="cluster-inventory-card" isExpanded={inventoryCardExpanded}>
          <CardHeader
            onExpand={() => setInventoryCardExpanded(!inventoryCardExpanded)}
            toggleButtonProps={{
              id: 'inventory-card-toggle-button',
              'aria-label': 'Hosts inventory',
              'aria-labelledby': 'titleId inventory-card-toggle-button',
              'aria-expanded': inventoryCardExpanded,
            }}
          >
            <CardTitle id="titleId">Hosts inventory</CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <HostsTable
                hosts={cluster.hosts}
                EmptyState={() => <div>empty</div>}
                columns={hostsTableColumns}
                className="agents-table"
                AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
              />
            </CardBody>
          </CardExpandableContent>
        </Card>
      </StackItem>
      <StackItem>
        <Card id="cluster-details-card" isExpanded={detailsCardExpanded}>
          <CardHeader
            onExpand={() => setDetailsCardExpanded(!detailsCardExpanded)}
            toggleButtonProps={{
              id: 'details-card-toggle-button',
              'aria-label': 'Details',
              'aria-labelledby': 'titleId details-card-toggle-button',
              'aria-expanded': detailsCardExpanded,
            }}
          >
            <CardTitle id="titleId">Details</CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <ClusterPropertiesList
                name={clusterDeployment.metadata?.name}
                id={clusterDeployment.metadata?.uid}
                openshiftVersion={agentClusterInstall?.spec?.imageSetRef?.name}
                baseDnsDomain={clusterDeployment.spec?.baseDomain}
                apiVip={agentClusterInstall?.spec?.apiVIP}
                ingressVip={agentClusterInstall?.spec?.ingressVIP}
                clusterNetworkCidr={agentClusterInstall.spec?.networking?.clusterNetwork?.[0].cidr}
                clusterNetworkHostPrefix={
                  agentClusterInstall.spec?.networking?.clusterNetwork?.[0]?.hostPrefix
                }
                serviceNetworkCidr={agentClusterInstall.spec?.networking?.serviceNetwork?.[0]}
                installedTimestamp={clusterDeployment.status?.installedTimestamp}
              />
            </CardBody>
          </CardExpandableContent>
        </Card>
      </StackItem>
      <StackItem>
        <ValidatedConditionAlert condition={getClusterValidatedCondition(agentClusterInstall)} />
      </StackItem>
    </Stack>
  );
};

export default ClusterDeploymentDetails;
