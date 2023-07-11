import { day2FlowIds } from '../constants';

const infraEnv = {
  id: day2FlowIds.day1.infraEnvId,
  cluster_id: day2FlowIds.day1.aiClusterId,
  cpu_architecture: 'x86_64',
  created_at: '2023-06-22T14:16:30.634444Z',
  download_url: `https://api.stage.openshift.com/api/assisted-images/images/${day2FlowIds.day1.infraEnvId}?arch=x86_64&image_token=some-token&type=minimal-iso&version=4.12`,
  email_domain: 'redhat.com',
  expires_at: '2023-06-22T18:16:30.000Z',
  href: `/api/assisted-install/v2/infra-envs/${day2FlowIds.day1.infraEnvId}`,
  kind: 'InfraEnv',
  name: 'test-infra-infra-env-1f23ee75',
  openshift_version: '4.12',
  org_id: '11009103',
  proxy: {},
  pull_secret_set: true,
  ssh_authorized_key: 'ssh-rsa = fake@some-domain.com',
  type: 'minimal-iso',
  updated_at: '2023-06-22T14:16:31.592257Z',
  user_name: 'rh-ee-someone',
};

export { infraEnv };
