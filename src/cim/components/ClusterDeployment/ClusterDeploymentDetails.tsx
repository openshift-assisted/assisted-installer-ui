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
import ClusterPropertiesList from '../../../common/components/clusterDetail/ClusterPropertiesList';
import { getAICluster } from '../helpers/toAssisted';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentCredentials from './ClusterDeploymentCredentials';
import {
  formatEventsData,
  shouldShowClusterCredentials,
  shouldShowClusterInstallationProgress,
} from './helpers';
import { EventsModalButton } from '../../../common/components/ui/eventsModal';
import { EventListFetchProps } from '../../../common/types/events';
import AgentTable from '../Agent/AgentTable';
import { FetchSecret } from './types';
import { getConsoleUrl } from '../helpers/clusterDeployment';
import ClusterDeploymentKubeconfigDownload from './ClusterDeploymentKubeconfigDownload';

type ClusterDeploymentDetailsProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  fetchSecret: FetchSecret;
  agentTableClassName?: string;
};

const ClusterDeploymentDetails: React.FC<ClusterDeploymentDetailsProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  fetchSecret,
  agentTableClassName,
}) => {
  const [progressCardExpanded, setProgressCardExpanded] = React.useState(true);
  const [inventoryCardExpanded, setInventoryCardExpanded] = React.useState(true);
  const [detailsCardExpanded, setDetailsCardExpanded] = React.useState(true);

  const clusterAgents = agents.filter(
    (a) =>
      a.spec.clusterDeploymentName?.name === clusterDeployment.metadata?.name &&
      a.spec.clusterDeploymentName?.namespace === clusterDeployment.metadata?.namespace,
  );

  const handleFetchEvents: EventListFetchProps['onFetchEvents'] = async (
    props,
    onSuccess,
    onError,
  ) => {
    try {
      const eventsURL = agentClusterInstall.status?.debugInfo?.eventsURL;
      if (!eventsURL) throw 'Events URL is not available.';

      const res = await fetch(eventsURL);
      const rawData: Record<string, string>[] = await res.json();
      const data = formatEventsData(rawData);

      onSuccess(data);
    } catch (e) {
      onError('Failed to fetch cluster events.');
    }
  };

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents: clusterAgents });
  return (
    <Stack hasGutter>
      {shouldShowClusterInstallationProgress(agentClusterInstall) && (
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
                  {shouldShowClusterCredentials(agentClusterInstall) && (
                    <StackItem>
                      <ClusterDeploymentCredentials
                        clusterDeployment={clusterDeployment}
                        agentClusterInstall={agentClusterInstall}
                        agents={clusterAgents}
                        fetchSecret={fetchSecret}
                        consoleUrl={getConsoleUrl(clusterDeployment)}
                      />
                    </StackItem>
                  )}
                  <StackItem>
                    <ClusterDeploymentKubeconfigDownload
                      clusterDeployment={clusterDeployment}
                      agentClusterInstall={agentClusterInstall}
                      fetchSecret={fetchSecret}
                    />{' '}
                    <EventsModalButton
                      id="cluster-events-button"
                      entityKind="cluster"
                      cluster={cluster}
                      title="Cluster Events"
                      variant={ButtonVariant.link}
                      style={{ textAlign: 'right' }}
                      onFetchEvents={handleFetchEvents}
                      ButtonComponent={Button}
                    >
                      View Cluster Events
                    </EventsModalButton>
                  </StackItem>
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
              <AgentTable agents={clusterAgents} className={agentTableClassName} />
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
    </Stack>
  );
};

export default ClusterDeploymentDetails;
