/* eslint-disable @typescript-eslint/naming-convention */

import { hostIds } from './index';
import { getHostInventory } from '../cluster/host-inventory';
import { fakeClusterId, fakeClusterInfraEnvId } from '../cluster/base-cluster';

import { hostValidationsInfo } from '../cluster/validation-info-host-discovery';

const baseHost = {
  infra_env_id: fakeClusterInfraEnvId,
  cluster_id: fakeClusterId,
  checked_in_at: '2022-04-19T15:15:56.924Z',
  deleted_at: null,
  discovery_agent_version: 'latest',
  installation_disk_id: '/dev/sda',
  installation_disk_path: '/dev/sda',
  kind: 'Host',
  logs_collected_at: '0001-01-01T00:00:00.000Z',
  logs_started_at: '0001-01-01T00:00:00.000Z',
  progress: {
    stage_started_at: '0001-01-01T00:00:00.000Z',
    stage_updated_at: '0001-01-01T00:00:00.000Z',
  },
  progress_stages: [
    'Starting installation',
    'Installing',
    'Waiting for bootkube',
    'Writing image to disk',
    'Rebooting',
    'Done',
  ],
  requested_hostname: 'localhost',
  role: 'master',
  stage_started_at: '0001-01-01T00:00:00.000Z',
  stage_updated_at: '0001-01-01T00:00:00.000Z',
  status: 'insufficient',
  status_info:
    "Host cannot be installed due to following failing validation(s): Host couldn't synchronize with any NTP server ; Hostname localhost is forbidden",
  status_updated_at: '2022-04-19T15:15:57.594Z',
  updated_at: '2022-04-19T15:15:57.594109Z',
  user_name: 'admin',
};

const hostDiscover = (hostIndex) => {
  const hostId = hostIds[hostIndex];
  return {
    ...baseHost,
    id: hostId,
    href: `/api/assisted-install/v2/infra-envs/${fakeClusterInfraEnvId}/hosts/${hostId}`,
    created_at: Date.now() - Math.floor(Math.random() * 2000), // just to get some time difference for each host
    inventory: JSON.stringify(getHostInventory()),
    status: 'insufficient',
    status_info:
      "Host cannot be installed due to following failing validation(s): Host couldn't synchronize with any NTP server ; Hostname localhost is forbidden",
    validations_info: JSON.stringify(hostValidationsInfo),
  };
};

export { hostDiscover };
