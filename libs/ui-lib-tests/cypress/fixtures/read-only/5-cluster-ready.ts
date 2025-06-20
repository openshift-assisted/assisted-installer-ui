/* eslint-disable @typescript-eslint/naming-convention */

import { baseCluster, fakeClusterId } from '../cluster/base-cluster';
import { clusterReadyValidations } from '../cluster/validation-info-cluster-ready';
import { hostIds } from '../hosts';

const featureUsage = {
  'SDN network type': {
    id: 'SDN_NETWORK_TYPE',
    name: 'SDN network type',
  },
};

const readOnlyCluster = {
  e2e_mock_source: '1-base-cluster',
  ...baseCluster('read-only-cluster'),
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
      cidr: '172.40.0.0/16',
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
  user_managed_networking: false,
  network_type: 'OpenShiftSDN',
  machine_networks: [
    {
      cidr: '192.168.122.0/24',
      cluster_id: fakeClusterId,
    },
  ],
  host_networks: [
    {
      cidr: '192.168.122.0/24',
      host_ids: [hostIds[0], hostIds[1], hostIds[2]],
    },
  ],

  feature_usage: JSON.stringify(featureUsage),
  status: 'ready',
  status_info: 'Cluster ready to be installed',
  validations_info: JSON.stringify(clusterReadyValidations.clusterValidationsInfo),
  control_plane_count: 3,
  permissions: {
    canEdit: false,
  },
};

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

export { readOnlyCluster, bundles, supported_operators };
