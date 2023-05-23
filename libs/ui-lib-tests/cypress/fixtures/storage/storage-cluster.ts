import { fakeClusterId } from '../cluster/base-cluster';

const featureUsage = {
  'Cluster managed networking with VMs': {
    data: {
      'VM Hosts': [
        'bb566d48-9b73-4047-9d4c-ae08618a5ed1',
        'cf2f3477-896f-40be-876a-b2ac3f2a838c',
        '55a258b2-687d-48de-9549-8e9b5b63cd9e',
        'c2839ec2-3a70-421a-8a6a-a537aa4df609',
        '04ce1396-404e-4967-814c-c10f163dd35a',
      ],
    },
    id: 'CLUSTER_MANAGED_NETWORKING_WITH_VMS',
    name: 'Cluster managed networking with VMs',
  },
  LSO: {
    id: 'LSO',
    name: 'LSO',
  },
  ODF: {
    id: 'ODF',
    name: 'ODF',
  },
  'Requested hostname': {
    data: {
      host_count: 1,
    },
    id: 'REQUESTED_HOSTNAME',
    name: 'Requested hostname',
  },
  'SDN network type': {
    id: 'SDN_NETWORK_TYPE',
    name: 'SDN network type',
  },
};

const clusterValidation = {
  configuration: [
    {
      id: 'pull-secret-set',
      status: 'success',
      message: 'The pull secret is set.',
    },
  ],
  'hosts-data': [
    {
      id: 'all-hosts-are-ready-to-install',
      status: 'success',
      message: 'All hosts are ready to install.',
    },
    {
      id: 'sufficient-masters-count',
      status: 'success',
      message: 'The cluster has a sufficient number of master candidates.',
    },
  ],
  network: [
    {
      id: 'api-vip-defined',
      status: 'success',
      message: 'The API virtual IP is correct.',
    },
  ],
  operators: [
    {
      id: 'cnv-requirements-satisfied',
      status: 'success',
      message: 'cnv is disabled',
    },
    {
      id: 'lso-requirements-satisfied',
      status: 'success',
      message: 'lso is disabled',
    },
    {
      id: 'odf-requirements-satisfied',
      status: 'success',
      message: 'odf is disabled',
    },
    {
      id: 'lvm-requirements-satisfied',
      status: 'success',
      message: 'lvm is disabled',
    },
  ],
};

const storageCluster = {
  base_dns_domain: 'redhat.com',
  cluster_networks: [{ cidr: '10.128.0.0/14', cluster_id: fakeClusterId, host_prefix: 23 }],
  connectivity_majority_groups:
    '{"192.168.122.0/24":["04ce1396-404e-4967-814c-c10f163dd35a","55a258b2-687d-48de-9549-8e9b5b63cd9e","bb566d48-9b73-4047-9d4c-ae08618a5ed1","c2839ec2-3a70-421a-8a6a-a537aa4df609","cf2f3477-896f-40be-876a-b2ac3f2a838c"],"IPv4":["04ce1396-404e-4967-814c-c10f163dd35a","55a258b2-687d-48de-9549-8e9b5b63cd9e","bb566d48-9b73-4047-9d4c-ae08618a5ed1","c2839ec2-3a70-421a-8a6a-a537aa4df609","cf2f3477-896f-40be-876a-b2ac3f2a838c"],"IPv6":["04ce1396-404e-4967-814c-c10f163dd35a","55a258b2-687d-48de-9549-8e9b5b63cd9e","bb566d48-9b73-4047-9d4c-ae08618a5ed1","c2839ec2-3a70-421a-8a6a-a537aa4df609","cf2f3477-896f-40be-876a-b2ac3f2a838c"]}',
  controller_logs_collected_at: '0001-01-01T00:00:00.000Z',
  controller_logs_started_at: '0001-01-01T00:00:00.000Z',
  cpu_architecture: 'x86_64',
  created_at: '2022-08-16T12:35:57.714654Z',
  deleted_at: null,
  disk_encryption: { enable_on: 'none', mode: 'tpmv2' },
  email_domain: 'Unknown',
  enabled_host_count: 5,
  feature_usage: JSON.stringify(featureUsage),
  high_availability_mode: 'Full',
  host_networks: [
    {
      cidr: '192.168.122.0/24',
      host_ids: [
        'bb566d48-9b73-4047-9d4c-ae08618a5ed1',
        'c2839ec2-3a70-421a-8a6a-a537aa4df609',
        '55a258b2-687d-48de-9549-8e9b5b63cd9e',
        '04ce1396-404e-4967-814c-c10f163dd35a',
        'cf2f3477-896f-40be-876a-b2ac3f2a838c',
      ],
    },
  ],
  hosts: [],
  href: `/api/assisted-install/v2/clusters/${fakeClusterId}`,
  hyperthreading: 'all',
  id: fakeClusterId,
  ignition_endpoint: {},
  image_info: { created_at: '0001-01-01T00:00:00Z', expires_at: '0001-01-01T00:00:00.000Z' },
  install_completed_at: '0001-01-01T00:00:00.000Z',
  install_started_at: '0001-01-01T00:00:00.000Z',
  kind: 'Cluster',
  machine_networks: [
    {
      cidr: '192.168.122.0/24',
      cluster_id: fakeClusterId,
    },
  ],
  monitored_operators: [
    {
      cluster_id: fakeClusterId,
      name: 'console',
      operator_type: 'builtin',
      status_updated_at: '0001-01-01T00:00:00.000Z',
      timeout_seconds: 3600,
    },
    {
      cluster_id: fakeClusterId,
      name: 'odf',
      namespace: 'openshift-storage',
      operator_type: 'olm',
      status_updated_at: '0001-01-01T00:00:00.000Z',
      subscription_name: 'odf-operator',
      timeout_seconds: 1800,
    },
    {
      cluster_id: fakeClusterId,
      name: 'lso',
      namespace: 'openshift-local-storage',
      operator_type: 'olm',
      status_updated_at: '0001-01-01T00:00:00.000Z',
      subscription_name: 'local-storage-operator',
      timeout_seconds: 4200,
    },
  ],
  name: 'storage-test-odf',
  network_type: 'OpenShiftSDN',
  ocp_release_image: 'quay.io/openshift-release-dev/ocp-release:4.10.24-x86_64',
  openshift_version: '4.10.24',
  platform: { type: 'baremetal' },
  progress: {},
  pull_secret_set: true,
  schedulable_masters: false,
  schedulable_masters_forced_true: false,
  service_networks: [{ cidr: '172.30.0.0/16', cluster_id: fakeClusterId }],
  status: 'ready',
  status_info: 'Cluster ready to be installed',
  status_updated_at: '2022-08-16T12:36:06.121Z',
  total_host_count: 5,
  updated_at: '2022-08-16T13:29:02.94962Z',
  user_managed_networking: false,
  user_name: 'admin',
  validations_info: JSON.stringify(clusterValidation),
  vip_dhcp_allocation: false,
  api_vip: '192.168.122.10',
  ingress_vip: '192.168.122.110',
};

export default storageCluster;
