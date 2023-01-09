/* eslint-disable @typescript-eslint/no-explicit-any */
import mapKeys from 'lodash/mapKeys';
import camelCase from 'lodash/camelCase';
import uniq from 'lodash/uniq';
import { EventList } from '../../../common/api/types';
import {
  AgentClusterInstallK8sResource,
  InfraEnvK8sResource,
  BareMetalHostK8sResource,
} from '../../types/k8s';
import { getClusterStatus } from '../helpers/status';
import { getK8sProxyURL } from '../helpers/proxy';
import { getInfraEnvNameOfAgent } from '../helpers/agents';
import { EventListFetchProps } from '../../../common';
import { ClusterDeploymentK8sResource, AgentK8sResource } from '../../types';
import { INFRAENV_GENERATED_AI_FLOW, BMH_HOSTNAME_ANNOTATION } from '../common/constants';
import { gridSpans } from '@patternfly/react-core';
import { getErrorMessage } from '../../../common/utils';
export const shouldShowClusterDeploymentValidationOverview = (
  agentClusterInstall?: AgentClusterInstallK8sResource,
) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);
  return (
    agentClusterInstall?.status?.validationsInfo &&
    (['insufficient', 'pending-for-input'].includes(clusterStatus) ||
      (clusterStatus === 'ready' && agentClusterInstall.spec?.holdInstallation))
  );
};

export const shouldShowClusterCredentials = (
  agentClusterInstall?: AgentClusterInstallK8sResource,
) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);
  return ['installed', 'adding-hosts'].includes(clusterStatus);
};

export const shouldShowClusterInstallationProgress = (
  agentClusterInstall?: AgentClusterInstallK8sResource,
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

export const isInstallationInProgress = (agentClusterInstall: AgentClusterInstallK8sResource) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);

  if (
    !agentClusterInstall?.spec?.holdInstallation &&
    ['insufficient', 'ready'].includes(clusterStatus)
  ) {
    // special initial state
    return true;
  }

  return [
    'preparing-for-installation',
    'installing',
    'finalizing',
    'installing-pending-user-action',
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
  rawData.map((event: any) => mapKeys(event, (value, key) => camelCase(key)));

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

export const getOnFetchEventsHandler =
  (
    fetchEvents: (url: string) => Promise<string>,
    aiNamespace: string,
    agentClusterInstall?: AgentClusterInstallK8sResource,
  ): EventListFetchProps['onFetchEvents'] =>
  async (params, onSuccess, onError) => {
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
      onError(getErrorMessage(e));
    }
  };

export const isCIMFlow = (clusterDeployment?: ClusterDeploymentK8sResource) =>
  !clusterDeployment?.spec?.platform?.agentBareMetal?.agentSelector?.matchLabels?.[
    INFRAENV_GENERATED_AI_FLOW
  ];

export const isAgentOfInfraEnv = (infraEnv?: InfraEnvK8sResource, agent?: AgentK8sResource) =>
  getInfraEnvNameOfAgent(agent) === infraEnv?.metadata?.name &&
  agent?.metadata?.namespace === infraEnv?.metadata?.namespace;

export const isAgentOfCluster = (agent: AgentK8sResource, cdName?: string, cdNamespace?: string) =>
  agent.spec?.clusterDeploymentName?.name === cdName &&
  agent.spec?.clusterDeploymentName?.namespace === cdNamespace;

export const getAgentsHostsNames = (
  agents: AgentK8sResource[] = [],
  bmhs: BareMetalHostK8sResource[] = [],
): string[] => {
  const raw: (string | undefined)[] = agents.map(
    (agent) => agent.spec?.hostname || agent.status?.inventory?.hostname,
  );
  bmhs.forEach((bmh) => {
    const hostname = bmh.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION];
    if (hostname) {
      raw.push(hostname);
    }
  });
  return uniq(raw.filter(Boolean)) as string[];
};

export const getGridSpans = (
  isPreviewOpen: boolean,
): {
  span: gridSpans;
  lg?: gridSpans;
  xl?: gridSpans;
  xl2?: gridSpans;
} =>
  isPreviewOpen
    ? {
        span: 12,
      }
    : {
        span: 12,
        lg: 10,
        xl: 9,
        xl2: 7,
      };
