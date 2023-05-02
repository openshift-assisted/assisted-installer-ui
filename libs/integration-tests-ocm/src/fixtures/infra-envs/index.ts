/* eslint-disable @typescript-eslint/naming-convention */

import { fakeClusterId, fakeClusterInfraEnvId } from '../cluster/base-cluster';

const isoDownloadLink = `${Cypress.env(
  'API_BASE_URL',
)}/images/${fakeClusterInfraEnvId}?arch=x86_64&type=full-iso&version=4.9`;

const infraEnv = {
  id: fakeClusterInfraEnvId,
  cluster_id: fakeClusterId,
  href: `/api/assisted-install/v2/infra-envs/${fakeClusterInfraEnvId}`,
  download_url: isoDownloadLink,
  cpu_architecture: 'x86_64',
  created_at: '2022-04-19T10:18:35.159254Z',
  email_domain: 'Unknown',
  expires_at: '0001-01-01T00:00:00.000Z',
  kind: 'InfraEnv',
  name: 'infra-env-test_infra-env',
  openshift_version: '4.9',
  proxy: {},
  pull_secret_set: true,
  type: 'full-iso',
  updated_at: '2022-04-19T10:18:35.163383Z',
  user_name: 'admin',
};

const imageDownload = {
  expires_at: '0001-01-01T00:00:00.000Z',
  url: isoDownloadLink,
};

export { infraEnv, imageDownload, isoDownloadLink };
