/* eslint-disable @typescript-eslint/naming-convention */
import { baseCluster, fakeClusterId, fakeClusterInfraEnvId } from '../cluster/base-cluster';
import { clusterValidationsInfo } from '../cluster/validation-info-initial-cluster';
import { dummyStaticNetworkConfig } from './static-network-config';

const featureUsage = {
  'OVN network type': {
    id: 'OVN_NETWORK_TYPE',
    name: 'OVN network type',
  },
};

const getBaseCluster = ({ name }) => ({
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
  high_availability_mode: 'Full',
});

const getBaseInfraEnv = () => ({
  id: fakeClusterInfraEnvId,
  name: 'static-ip_infra-env',
  cluster_id: fakeClusterId,
  cpu_architecture: 'x86_64',
  static_network_config: JSON.stringify(dummyStaticNetworkConfig),
  href: `/api/assisted-install/v2/infra-envs/${fakeClusterInfraEnvId}`,
  download_url: `http://locahost:5000/images/${fakeClusterInfraEnvId}?arch=x86_64&type=full-iso&version=4.9`,
  created_at: '2022-04-19T10:18:35.159254Z',
  email_domain: 'Unknown',
  expires_at: '0001-01-01T00:00:00.000Z',
  kind: 'InfraEnv',
  openshift_version: '4.9',
  proxy: {},
  pull_secret_set: true,
  type: 'full-iso',
  updated_at: '2022-04-19T10:18:35.163383Z',
  user_name: 'admin',
});

export { getBaseCluster, getBaseInfraEnv };
