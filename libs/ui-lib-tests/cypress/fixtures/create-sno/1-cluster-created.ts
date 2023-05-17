/* eslint-disable @typescript-eslint/naming-convention */

import { baseCluster, fakeClusterId } from '../cluster/base-cluster';
import { clusterValidationsInfo } from '../cluster/validation-info-initial-cluster';

const featureUsage = {
  'OVN network type': {
    id: 'OVN_NETWORK_TYPE',
    name: 'OVN network type',
  },
  SNO: {
    id: 'SNO',
    name: 'SNO',
  },
};

const getSnoCluster = ({ name }) => ({
  // We're adding this field to easily debug which mock is returning the response
  e2e_mock_source: '1-base-cluster',
  monitored_operators: [
    {
      cluster_id: fakeClusterId,
      name: 'console',
      operator_type: 'builtin',
      status_updated_at: '0001-01-01T00:00:00.000Z',
      timeout_seconds: 3600,
    },
  ],
  cluster_networks: [
    {
      cidr: '10.128.0.0/14',
      cluster_id: fakeClusterId,
      host_prefix: 23,
    },
  ],
  service_networks: [
    {
      cidr: '172.30.0.0/16',
      cluster_id: fakeClusterId,
    },
  ],
  feature_usage: JSON.stringify(featureUsage),
  validations_info: JSON.stringify(clusterValidationsInfo),
  ...baseCluster(name),
});

export { getSnoCluster };
