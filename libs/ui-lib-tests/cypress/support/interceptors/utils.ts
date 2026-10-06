import * as fixtures from '../../fixtures';

const { day2FlowIds } = fixtures;

export const allInfraEnvsApiPath = '/api/assisted-install/v2/infra-envs/';
export const allClustersApiPath = '/api/assisted-install/v2/clusters/';

export const x86 = 'x86_64';
export const arm = 'arm64';

export type Archs = typeof x86 | typeof arm;

export const getDay1ClusterApiPath = () => `${allClustersApiPath}${Cypress.env('clusterId')}`;
export const getDay1InfraEnvApiPath = () => `${allInfraEnvsApiPath}${Cypress.env('infraEnvId')}`;
export const getDay2InfraEnvApiPath = (cpuArch?: Archs) =>
  `${allInfraEnvsApiPath}${day2FlowIds.day2.infraEnvIds[cpuArch || x86]}`;
export const getDay2ClusterApiPath = () => `${allClustersApiPath}${day2FlowIds.day2.aiClusterId}`;
export const day2InfraEnvDetailsUrl = new RegExp(
  `${getDay2InfraEnvApiPath(x86)}|${getDay2InfraEnvApiPath(arm)}`,
);
export const getDay1ClusterPreflightRequirementsApiPath = () =>
  `${allClustersApiPath}${Cypress.env('clusterId')}/preflight-requirements`;

export const getDay2InfraEnv = (cpuArch: Archs) => fixtures.day2InfraEnvs[cpuArch];
export const getCpuArchitectureParam = (cpuArch: string): Archs | undefined => {
  if (!cpuArch) {
    return undefined;
  }
  if (cpuArch === x86 || cpuArch === arm) {
    return cpuArch;
  }
  throw new Error('Invalid cpu arch ' + cpuArch);
};

export const transformClusterFixture = (fixtureMapping) => {
  const { clusters: clusterFixtures, hosts: hostsFixtures } = fixtureMapping;
  const baseCluster =
    clusterFixtures[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping.clusters['default'];
  baseCluster.platform.type = Cypress.env('AI_INTEGRATED_PLATFORM') || 'baremetal';

  const hosts = hostsFixtures
    ? hostsFixtures[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping.hosts['default']
    : fixtures.getUpdatedHosts();
  return { ...baseCluster, hosts };
};

export const transformInfraEnvFixture = (fixtureMapping) => {
  return fixtureMapping[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping['default'];
};

export const getScenarioFixtureMapping = () => {
  let fixtureMapping = null;
  switch (Cypress.env('AI_SCENARIO')) {
    case 'AI_CREATE_SNO':
      fixtureMapping = fixtures.createSnoFixtureMapping;
      break;
    case 'AI_CREATE_MULTINODE':
      fixtureMapping = fixtures.createMultinodeFixtureMapping;
      break;
    case 'AI_CREATE_DUALSTACK':
      fixtureMapping = fixtures.createDualStackFixtureMapping;
      break;
    case 'AI_READONLY_CLUSTER':
      fixtureMapping = fixtures.createReadOnlyFixtureMapping;
      break;
    case 'AI_STORAGE_CLUSTER':
      fixtureMapping = fixtures.createStorageFixtureMapping;
      break;
    case 'AI_DISK_HOLDERS_CLUSTER':
      fixtureMapping = fixtures.createDiskHoldersFixtureMapping;
      break;
    case 'AI_CREATE_STATIC_IP':
      fixtureMapping = fixtures.createStaticIpFixtureMapping;
      break;
    case 'AI_CREATE_CUSTOM_MANIFESTS':
      fixtureMapping = fixtures.createCustomManifestsFixtureMapping;
      break;
    case 'AI_OVE_CREATE_MULTINODE':
      fixtureMapping = fixtures.createOveMultinodeFixtureMapping;
      break;
    default:
      break;
  }
  return fixtureMapping;
};
