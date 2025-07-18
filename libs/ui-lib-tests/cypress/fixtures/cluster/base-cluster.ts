/* eslint-disable @typescript-eslint/naming-convention */

const fakeClusterId = 'fa39cf35-0b18-4e6a-b2c5-ef48784ff85e';
const fakeClusterInfraEnvId = 'ac722438-a01b-472c-b1f6-50cf3db4cc81';

const baseCluster = (name = Cypress.env('CLUSTER_NAME')) => ({
  id: fakeClusterId,
  href: `/api/assisted-install/v2/clusters/${fakeClusterId}`,
  name,
  openshift_version: Cypress.env('OPENSHIFT_VERSION'),
  api_vips: [],
  ingress_vips: [],
  base_dns_domain: 'redhat.com',
  cluster_network_cidr: '10.128.0.0/14',
  cluster_network_host_prefix: 23,
  controller_logs_collected_at: '0001-01-01T00:00:00.000Z',
  controller_logs_started_at: '0001-01-01T00:00:00.000Z',
  cpu_architecture: 'x86_64',
  created_at: '2022-04-19T15:11:22.905546Z',
  deleted_at: null,
  disk_encryption: {
    enable_on: 'none',
    mode: 'tpmv2',
  },
  email_domain: 'Unknown',
  control_plane_count: 1,
  host_networks: [],
  hosts: [],
  hyperthreading: 'all',
  ignition_endpoint: {},
  image_info: {
    created_at: '0001-01-01T00:00:00Z',
    expires_at: '0001-01-01T00:00:00.000Z',
  },
  install_completed_at: '0001-01-01T00:00:00.000Z',
  install_started_at: '0001-01-01T00:00:00.000Z',
  kind: 'Cluster',
  machine_networks: [],
  network_type: 'OVNKubernetes',
  ocp_release_image: 'quay.io/openshift-release-dev/ocp-release:4.9.23-x86_64',
  platform: {
    ovirt: {},
    type: 'baremetal',
  },
  pull_secret_set: true,
  schedulable_masters: false,
  schedulable_masters_forced_true: true,
  service_network_cidr: '172.30.0.0/16',
  status: 'insufficient',
  status_info: 'Cluster is not ready for install',
  status_updated_at: '2022-04-19T15:11:22.904Z',
  updated_at: '2022-04-19T15:11:22.905546Z',
  user_managed_networking: true,
  user_name: 'admin',
  vip_dhcp_allocation: false,
});

const bundles = [
  {
    description: 'Run virtual machines alongside containers on one platform.',
    id: 'virtualization',
    operators: ['cnv', 'nmstate', 'mtv'],
    title: 'Virtualization',
  },
  {
    description:
      'Train, serve, monitor and manage AI/ML models and applications using NVIDIA GPUs.',
    id: 'openshift-ai-nvidia',
    operators: [
      'servicemesh',
      'serverless',
      'openshift-ai',
      'authorino',
      'pipelines',
      'nvidia-gpu',
      'odf',
    ],
    title: 'OpenShift AI (NVIDIA)',
  },
];

const supported_operators = [
  'nvidia-gpu',
  'pipelines',
  'nmstate',
  'lvm',
  'node-feature-discovery',
  'openshift-ai',
  'authorino',
  'odf',
  'mce',
  'osc',
  'cnv',
  'mtv',
  'servicemesh',
  'serverless',
  'lso',
];

export { fakeClusterId, fakeClusterInfraEnvId, baseCluster, bundles, supported_operators };
