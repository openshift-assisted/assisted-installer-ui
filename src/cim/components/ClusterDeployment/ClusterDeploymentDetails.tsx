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
import { shouldShowClusterCredentials, shouldShowClusterInstallationProgress } from './helpers';
import { EventsModalButton } from '../../../common/components/ui/eventsModal';
import ClusterDeploymentDetailsTable from './ClusterDeploymentDetailsTable';
import { FetchSecret } from './types';
import { getClusterProperties, getConsoleUrl } from '../helpers/clusterDeployment';
import ClusterDeploymentKubeconfigDownload from './ClusterDeploymentKubeconfigDownload';
import { EventListFetchProps } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ClusterDeploymentDetailsProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  fetchSecret: FetchSecret;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
};

const ClusterDeploymentDetails: React.FC<ClusterDeploymentDetailsProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  fetchSecret,
  onFetchEvents,
}) => {
  const [progressCardExpanded, setProgressCardExpanded] = React.useState(true);
  const [inventoryCardExpanded, setInventoryCardExpanded] = React.useState(true);
  const [detailsCardExpanded, setDetailsCardExpanded] = React.useState(true);

  const clusterAgents = agents.filter(
    (a) =>
      a.spec.clusterDeploymentName?.name === clusterDeployment.metadata?.name &&
      a.spec.clusterDeploymentName?.namespace === clusterDeployment.metadata?.namespace,
  );

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents: clusterAgents });

  const clusterProperties = React.useMemo(
    () => getClusterProperties(clusterDeployment, agentClusterInstall),
    [clusterDeployment, agentClusterInstall],
  );
  const { t } = useTranslation();
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
              <CardTitle id="titleId">{t('ai:Cluster installation process')}</CardTitle>
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
                      title={t('ai:Cluster Events')}
                      variant={ButtonVariant.link}
                      style={{ textAlign: 'right' }}
                      onFetchEvents={onFetchEvents}
                      ButtonComponent={Button}
                    >
                      {t('ai:View Cluster Events')}
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
            <CardTitle id="titleId">{t('ai:Hosts inventory')}</CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <ClusterDeploymentDetailsTable
                agents={clusterAgents}
                agentClusterInstall={agentClusterInstall}
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
            <CardTitle id="titleId">{t('ai:Details')}</CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <ClusterPropertiesList
                leftItems={[
                  clusterProperties.name,
                  clusterProperties.openshiftVersion,
                  clusterProperties.clusterId,
                  clusterProperties.installedTimestamp,
                  clusterProperties.baseDnsDomain,
                ]}
                rightItems={[
                  clusterProperties.apiVip,
                  clusterProperties.ingressVip,
                  clusterProperties.clusterNetworkCidr,
                  clusterProperties.clusterNetworkHostPrefix,
                  clusterProperties.serviceNetworkCidr,
                ]}
              />
            </CardBody>
          </CardExpandableContent>
        </Card>
      </StackItem>
    </Stack>
  );
};

export default ClusterDeploymentDetails;
