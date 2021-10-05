/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash';
import { EventList } from '../../../common/api/types';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { getClusterStatus } from '../helpers/status';
import { k8sProxyURL } from '../helpers/proxy';

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

export const getLogsURL = (
  backendURL: string,
  agentClusterInstall?: AgentClusterInstallK8sResource,
) => {
  if (agentClusterInstall?.status?.debugInfo?.logsURL) {
    const logsURL = new URL(agentClusterInstall.status?.debugInfo?.logsURL);
    return `${backendURL}${k8sProxyURL}${logsURL.pathname}${logsURL.search}`;
  }
  return null;
};

// events are downloaded using ACM's wrapped fetchGet(), so the backendUrl is missing here
export const getEventsURL = (agentClusterInstall?: AgentClusterInstallK8sResource) => {
  if (agentClusterInstall?.status?.debugInfo?.eventsURL) {
    const eventsURL = new URL(agentClusterInstall.status?.debugInfo?.eventsURL);
    return `${k8sProxyURL}${eventsURL.pathname}${eventsURL.search}`;
  }
  return null;
};
