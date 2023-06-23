import { hostIds as fakeHostIds } from '../hosts';
import { fakeClusterId, fakeClusterInfraEnvId } from './base-cluster';

const clusterEvents = [
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T07:24:21.117Z',
    host_id: fakeHostIds[2],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-3: validation 'release-domain-name-resolved-correctly' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T07:24:21.114Z',
    host_id: fakeHostIds[1],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-2: validation 'release-domain-name-resolved-correctly' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T07:24:21.108Z',
    host_id: fakeHostIds[0],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-1: validation 'release-domain-name-resolved-correctly' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T07:23:33.113Z',
    host_id: fakeHostIds[2],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-3: validation 'release-domain-name-resolved-correctly' that used to succeed is now failing`,
    name: 'host_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T07:23:25.114Z',
    host_id: fakeHostIds[1],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-2: validation 'release-domain-name-resolved-correctly' that used to succeed is now failing`,
    name: 'host_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T07:23:25.108Z',
    host_id: fakeHostIds[0],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-1: validation 'release-domain-name-resolved-correctly' that used to succeed is now failing`,
    name: 'host_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T02:14:21.111Z',
    host_id: fakeHostIds[2],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-3: validation 'release-domain-name-resolved-correctly' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T02:14:13.114Z',
    host_id: fakeHostIds[1],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-2: validation 'release-domain-name-resolved-correctly' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T02:14:13.108Z',
    host_id: fakeHostIds[0],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-1: validation 'release-domain-name-resolved-correctly' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T02:13:25.115Z',
    host_id: fakeHostIds[2],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-3: validation 'release-domain-name-resolved-correctly' that used to succeed is now failing`,
    name: 'host_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T02:13:25.112Z',
    host_id: fakeHostIds[1],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-2: validation 'release-domain-name-resolved-correctly' that used to succeed is now failing`,
    name: 'host_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-09T02:13:25.107Z',
    host_id: fakeHostIds[0],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-1: validation 'release-domain-name-resolved-correctly' that used to succeed is now failing`,
    name: 'host_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:57:41.118Z',
    host_id: fakeHostIds[0],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env('HOST_RENAME')}-1: validation 'ntp-synced' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:57:41.115Z',
    host_id: fakeHostIds[2],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env('HOST_RENAME')}-0: validation 'ntp-synced' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:57:41.110Z',
    host_id: fakeHostIds[1],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env('HOST_RENAME')}-2: validation 'ntp-synced' is now fixed`,
    name: 'host_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:41.141Z',
    host_id: fakeHostIds[0],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-1: updated status from discovering to pending-for-input (Waiting for user input: Host couldn't synchronize with any NTP server ; Machine Network CIDR is undefined; the Machine Network CIDR can be defined by setting either the API or Ingress virtual IPs)`,
    name: 'host_status_updated',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:41.133Z',
    host_id: fakeHostIds[1],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-2: updated status from discovering to pending-for-input (Waiting for user input: Host couldn't synchronize with any NTP server ; Machine Network CIDR is undefined; the Machine Network CIDR can be defined by setting either the API or Ingress virtual IPs)`,
    name: 'host_status_updated',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:41.116Z',
    host_id: fakeHostIds[2],
    infra_env_id: fakeClusterInfraEnvId,
    message: `Host ${Cypress.env(
      'HOST_RENAME',
    )}-0: updated status from discovering to pending-for-input (Waiting for user input: Host couldn't synchronize with any NTP server ; Machine Network CIDR is undefined; the Machine Network CIDR can be defined by setting either the API or Ingress virtual IPs)`,
    name: 'host_status_updated',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:41.113Z',
    message: `Cluster validation 'all-hosts-are-ready-to-install' that used to succeed is now failing`,
    name: 'cluster_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:41.113Z',
    message: `Cluster validation 'sufficient-masters-count' is now fixed`,
    name: 'cluster_validation_fixed',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:41.112Z',
    message: `Cluster validation 'machine-cidr-defined' failed`,
    name: 'cluster_validation_failed',
    severity: 'warning',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:37.844Z',
    host_id: fakeHostIds[0],
    infra_env_id: fakeClusterInfraEnvId,
    message: 'Host f9991427-2e9f-42e1-9df6-613224df44c2: Successfully registered',
    name: 'host_registration_succeeded',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:37.529Z',
    host_id: fakeHostIds[1],
    infra_env_id: fakeClusterInfraEnvId,
    message: 'Host 9b05cf44-a09d-41dc-a492-4c21aecb5d3e: Successfully registered',
    name: 'host_registration_succeeded',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:36.049Z',
    host_id: fakeHostIds[2],
    infra_env_id: fakeClusterInfraEnvId,
    message: 'Host 767523cc-8374-44f0-a088-6906b4c6ba33: Successfully registered',
    name: 'host_registration_succeeded',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:12.543Z',
    infra_env_id: fakeClusterInfraEnvId,
    message: 'Updated image information (Image type is `minimal-iso`, SSH public key is set)',
    name: 'image_info_updated',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:55:01.113Z',
    message: 'Updated status of the cluster to pending-for-input',
    name: 'cluster_status_updated',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:54:59.340Z',
    infra_env_id: fakeClusterInfraEnvId,
    message: 'Updated image information (Image type is `minimal-iso`, SSH public key is set)',
    name: 'image_info_updated',
    severity: 'info',
  },
  {
    cluster_id: fakeClusterId,
    event_time: '2023-06-07T06:54:58.568Z',
    message: 'Successfully registered cluster',
    name: 'cluster_registration_succeeded',
    severity: 'info',
  },
];

export const getEvents = ({
  limit,
  offset,
  hostIds,
  severities,
  clusterLevel,
  message,
}: {
  limit: string | number;
  offset: string | number;
  hostIds?: string;
  severities?: string;
  clusterLevel?: boolean;
  message?: string;
}) => {
  let events = clusterEvents;

  if (message) {
    events = events.filter((event) => event.message.includes(message));
  }

  if (hostIds && clusterLevel) {
    events = events.filter((event) => !event.host_id || hostIds.includes(event.host_id));
  } else if (hostIds) {
    events = events.filter((event) => event.host_id && hostIds.includes(event.host_id));
  } else if (clusterLevel) {
    events = events.filter((event) => !event.host_id);
  }

  if (severities) {
    events = clusterEvents.filter((event) => event.severity && severities.includes(event.severity));
  }

  return events.slice(Number(offset), Number(offset) + Number(limit));
};

export const getEventHeaders = (query: Record<string, string | number>) => {
  const severitiesFilter = {
    offset: '0',
    limit: '100',
    hostIds: query['host_ids'] as string,
    clusterLevel: !!query['cluster_level'],
    message: query['message'] as string,
  };

  return {
    'Event-Count': getEvents({
      ...severitiesFilter,
      severities: query['severities'] as string,
    }).length.toString(),
    'Severity-Count-Critical': getEvents({
      ...severitiesFilter,
      severities: 'critical',
    }).length.toString(),
    'Severity-Count-Error': getEvents({
      ...severitiesFilter,
      severities: 'error',
    }).length.toString(),
    'Severity-Count-Info': getEvents({
      ...severitiesFilter,
      severities: 'info',
    }).length.toString(),
    'Severity-Count-Warning': getEvents({
      ...severitiesFilter,
      severities: 'warning',
    }).length.toString(),
  };
};
