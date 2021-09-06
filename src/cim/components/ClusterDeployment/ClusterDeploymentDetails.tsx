/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { saveAs } from 'file-saver';
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
import ClusterPropertiesList from '../../../common/components/clusterDetail/ClusterPropertiesList';
import { getAICluster } from '../helpers/toAssisted';
import { getClusterStatus } from '../helpers/status';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentCredentials from './ClusterDeploymentCredentials';
import {
  formatEventsData,
  shouldShowClusterCredentials,
  shouldShowClusterInstallationError,
  shouldShowClusterInstallationProgress,
} from './helpers';
import ClusterInstallationError from './ClusterInstallationError';
import { EventsModalButton } from '../../../common/components/ui/eventsModal';
import KubeconfigDownload from '../../../common/components/clusterDetail/KubeconfigDownload';
import { EventListFetchProps } from '../../../common/types/events';
import AgentTable from '../Agent/AgentTable';
import { FetchSecret } from './types';
import ClusterDeploymentProgress from './ClusterDeploymentProgress';

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

  const handleKubeconfigDownload = async () => {
    const kubeconfigSecretName =
      agentClusterInstall.spec?.clusterMetadata?.adminKubeconfigSecretRef?.name;
    const kubeconfigSecretNamespace = clusterDeployment.metadata?.namespace;

    if (kubeconfigSecretName && kubeconfigSecretNamespace) {
      try {
        const kubeconfigSecret = await fetchSecret(kubeconfigSecretName, kubeconfigSecretNamespace);
        const kubeconfig = kubeconfigSecret.data?.kubeconfig;

        if (!kubeconfig) throw new Error('Kubeconfig is empty.');

        const blob = new Blob([atob(kubeconfig)], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'kubeconfig.json');
      } catch (e) {
        console.error('Failed to fetch kubeconfig secret.', e);
      }
    }
  };

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

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });
  const [clusterStatus, clusterStatusInfo] = getClusterStatus(agentClusterInstall);
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
                  <StackItem>
                    <ClusterDeploymentProgress
                      clusterDeployment={clusterDeployment}
                      agentClusterInstall={agentClusterInstall}
                      agents={agents}
                      onFetchEvents={handleFetchEvents}
                    />
                  </StackItem>
                  {shouldShowClusterCredentials(agentClusterInstall) && (
                    <StackItem>
                      <ClusterDeploymentCredentials
                        clusterDeployment={clusterDeployment}
                        agentClusterInstall={agentClusterInstall}
                        agents={agents}
                        fetchSecret={fetchSecret}
                        consoleUrl={
                          clusterDeployment.status?.webConsoleURL ||
                          `https://console-openshift-console.apps.${clusterDeployment.spec?.clusterName}.${clusterDeployment.spec?.baseDomain}`
                        }
                      />
                    </StackItem>
                  )}
                  <StackItem>
                    <KubeconfigDownload
                      handleDownload={handleKubeconfigDownload}
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
                      onFetchEvents={handleFetchEvents}
                      ButtonComponent={Button}
                    >
                      View Cluster Events
                    </EventsModalButton>
                  </StackItem>
                  {shouldShowClusterInstallationError(agentClusterInstall) && (
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
              <AgentTable agents={agents} className={agentTableClassName} />
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
