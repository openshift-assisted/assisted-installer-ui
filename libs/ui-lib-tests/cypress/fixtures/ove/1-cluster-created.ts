import { baseCluster, fakeClusterId } from '../cluster/base-cluster';

const oveCluster = {
  ...baseCluster('ai-ove-mno'),
  openshift_version: '4.21.27',
  user_managed_networking: false,
  control_plane_count: 3,
  ocp_release_image: 'quay.io/openshift-release-dev/ocp-release@sha256:abc',

  cluster_networks: [
    {
      cidr: '10.128.0.0/14',
      cluster_id: fakeClusterId,
      host_prefix: 23,
    },
  ],
  feature_usage:
    '{"Hyperthreading":{"data":{"hyperthreading_enabled":"all"},"id":"HYPERTHREADING","name":"Hyperthreading"},"OVN network type":{"id":"OVN_NETWORK_TYPE","name":"OVN network type"}}',
  high_availability_mode: 'Full',
  host_networks: [],
  hosts: [],
  hyperthreading: 'all',
  id: fakeClusterId,
  ignition_endpoint: {},
  image_info: {
    created_at: '0001-01-01T00:00:00Z',
    expires_at: '0001-01-01T00:00:00.000Z',
  },
  install_completed_at: '0001-01-01T00:00:00.000Z',
  install_started_at: '0001-01-01T00:00:00.000Z',
  kind: 'Cluster',
  'last-installation-preparation': {},
  load_balancer: {
    type: 'cluster-managed',
  },
  monitored_operators: [
    {
      bundles: null,
      cluster_id: fakeClusterId,
      name: 'console',
      operator_type: 'builtin',
      status_updated_at: '0001-01-01T00:00:00.000Z',
      timeout_seconds: 3600,
    },
  ],
  org_soft_timeouts_enabled: true,
  service_networks: [
    {
      cidr: '172.30.0.0/16',
      cluster_id: fakeClusterId,
    },
  ],
  status: 'insufficient',
  status_info: 'Cluster is not ready for install',
  status_updated_at: '2026-09-04T16:19:51.086Z',
  updated_at: '2026-09-04T16:19:51.088294Z',
};

export { oveCluster };
