import { day2FlowIds } from '../constants';

const day1ClusterId = day2FlowIds.day1.aiClusterId;
const day2ClusterId = day2FlowIds.day2.aiClusterId;
const day2InfraEnvIds = day2FlowIds.day2.infraEnvIds;

const aiCluster = {
  id: day2ClusterId,
  openshift_cluster_id: day1ClusterId,
  api_vip_dns_name: 'api.day2-flow.redhat.com',
  api_vips: null,
  base_dns_domain: 'redhat.com',
  cluster_networks: null,
  controller_logs_collected_at: '0001-01-01T00:00:00.000Z',
  controller_logs_started_at: '0001-01-01T00:00:00.000Z',
  created_at: '2023-06-26T13:18:15.992518077Z',
  deleted_at: null,
  email_domain: 'redhat.com',
  host_networks: [],
  hosts: [],
  href: `/api/assisted-install/v2/clusters/${day2ClusterId}`,
  image_info: {
    created_at: '2023-06-26T13:18:15.992518077Z',
    expires_at: '0001-01-01T00:00:00.000Z',
  },
  imported: true,
  ingress_vips: null,
  install_completed_at: '0001-01-01T00:00:00.000Z',
  install_started_at: '0001-01-01T00:00:00.000Z',
  kind: 'AddHostsCluster',
  machine_networks: null,
  monitored_operators: null,
  name: 'day2-flow',
  org_id: '11009103',
  platform: {
    type: 'baremetal',
  },
  service_networks: null,
  status: 'adding-hosts',
  status_info: 'cluster is adding hosts to existing OCP cluster',
  status_updated_at: '2023-06-26T13:18:15.989Z',
  updated_at: '2023-06-26T13:18:15.992518077Z',
  user_name: 'rh-ee-someone',
};

const x68InfraEnv = {
  id: day2InfraEnvIds.x86_64,
  cluster_id: day2ClusterId,
  name: 'day2-flow_infra-env-x86_64',
  cpu_architecture: 'x86_64',
  download_url: `https://api.stage.openshift.com/api/assisted-images/images/${day2InfraEnvIds.x86_64}?arch=x86_64&image_token=some-token&type=minimal-iso&version=4.12`,
  href: `/api/assisted-install/v2/infra-envs/${day2InfraEnvIds.x86_64}`,
  created_at: '2023-06-26T13:18:16.508874Z',
  email_domain: 'redhat.com',
  expires_at: '2023-06-26T17:18:16.000Z',
  kind: 'InfraEnv',
  openshift_version: '4.12',
  org_id: '11009103',
  proxy: {},
  pull_secret_set: true,
  type: 'minimal-iso',
  updated_at: '2023-06-26T13:18:17.483493Z',
  user_name: 'rh-ee-someone',
};

const armInfraEnv = {
  ...x68InfraEnv,
  id: day2InfraEnvIds.arm64,
  name: 'day2-flow_infra-env-arm64',
  cpuArchitecture: 'arm64',
  download_url: `https://api.stage.openshift.com/api/assisted-images/images/${day2InfraEnvIds.arm64}?arch=arm64&image_token=some-token&type=minimal-iso&version=4.12`,
  href: `/api/assisted-install/v2/infra-envs/${day2InfraEnvIds.arm64}`,
};

const day2InfraEnvs = {
  x86_64: x68InfraEnv,
  arm64: armInfraEnv,
};

export { aiCluster as day2AiCluster, day2InfraEnvs };
