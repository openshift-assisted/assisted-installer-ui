/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash';
import { EventList } from '../../../common/api/types';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { getClusterStatus } from '../helpers/status';
import { getK8sProxyURL } from '../helpers/proxy';
import { EventListFetchProps } from '../../../common';
import { ClusterDeploymentK8sResource, AgentK8sResource } from '../../types';
import { INFRAENV_GENERATED_AI_FLOW } from '../common/constants';

export const shouldShowClusterCredentials = (
  agentClusterInstall: AgentClusterInstallK8sResource,
) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);
  return ['installed', 'adding-hosts'].includes(clusterStatus);
};

export const shouldShowClusterInstallationProgress = (
  agentClusterInstall: AgentClusterInstallK8sResource,
) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);
  return [
    'preparing-for-installation',
    'installing',
    'installing-pending-user-action',
    'finalizing',
    'installed',
    'error',
    'cancelled',
    'adding-hosts',
  ].includes(clusterStatus);
};

export const isInstallationReady = (agentClusterInstall: AgentClusterInstallK8sResource) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);
  return [
    'ready',
    'error',
    'preparing-for-installation',
    'installing',
    'finalizing',
    'installed',
    'adding-hosts',
    'cancelled',
    'installing-pending-user-action',
  ].includes(clusterStatus);
};

export const shouldShowClusterInstallationError = (
  agentClusterInstall: AgentClusterInstallK8sResource,
) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);
  return ['error', 'cancelled'].includes(clusterStatus);
};

export const formatEventsData = (rawData: any): EventList =>
  rawData.map((event: any) => _.mapKeys(event, (value, key) => _.camelCase(key)));

// events are downloaded using ACM's wrapped fetchGet(), so the backendUrl is missing here
const getEventsURL = (
  aiNamespace: string,
  agentClusterInstall?: AgentClusterInstallK8sResource,
) => {
  if (agentClusterInstall?.status?.debugInfo?.eventsURL) {
    const eventsURL = new URL(agentClusterInstall.status?.debugInfo?.eventsURL);
    return `${getK8sProxyURL(aiNamespace)}${eventsURL.pathname}${eventsURL.search}`;
  }
  return null;
};

export const getOnFetchEventsHandler = (
  fetchEvents: (url: string) => Promise<string>,
  aiNamespace: string,
  agentClusterInstall?: AgentClusterInstallK8sResource,
): EventListFetchProps['onFetchEvents'] => async (params, onSuccess, onError) => {
  const eventsURL = getEventsURL(aiNamespace, agentClusterInstall);
  if (!eventsURL) {
    onError('Cannot determine events URL');
    return;
  }
  try {
    const result = await fetchEvents(eventsURL);
    const data = formatEventsData(result);
    onSuccess(data);
  } catch (e) {
    onError(e.message);
  }
};

export const isCIMFlow = (clusterDeployment?: ClusterDeploymentK8sResource) =>
  !clusterDeployment?.spec?.platform?.agentBareMetal?.agentSelector?.matchLabels?.[
    INFRAENV_GENERATED_AI_FLOW
  ];

export const isAgentOfCluster = (agent: AgentK8sResource, cdName?: string, cdNamespace?: string) =>
  agent.spec?.clusterDeploymentName?.name === cdName &&
  agent.spec?.clusterDeploymentName?.namespace === cdNamespace;

export const getAgentsHostsNames = (agents: AgentK8sResource[]): string[] => {
  const raw: (string | undefined)[] = agents.map((agent) => agent.spec?.hostname);
  return _.uniq(raw.filter(Boolean)) as string[];
};
