import { HttpRequestInterceptor } from 'cypress/types/net-stubbing';

import { hasWizardSignal, setLastWizardSignal } from './utils';
import * as fixtures from '../fixtures';

const { day2FlowIds } = fixtures;

const allInfraEnvsApiPath = '/api/assisted-install/v2/infra-envs/';
const allClustersApiPath = '/api/assisted-install/v2/clusters/';

const x86 = 'x86_64';
const arm = 'arm64';

type Archs = typeof x86 | typeof arm;

const getDay1ClusterApiPath = () => `${allClustersApiPath}${Cypress.env('clusterId')}`;
const getDay1InfraEnvApiPath = () => `${allInfraEnvsApiPath}${Cypress.env('infraEnvId')}`;
const getDay2InfraEnvApiPath = (cpuArch?: Archs) =>
  `${allInfraEnvsApiPath}${day2FlowIds.day2.infraEnvIds[cpuArch || x86]}`;
const getDay2ClusterApiPath = () => `${allClustersApiPath}${day2FlowIds.day2.aiClusterId}`;
const day2InfraEnvDetailsUrl = new RegExp(
  `${getDay2InfraEnvApiPath(x86)}|${getDay2InfraEnvApiPath(arm)}`,
);

const getDay2InfraEnv = (cpuArch: Archs) => fixtures.day2InfraEnvs[cpuArch];
const getCpuArchitectureParam = (cpuArch: string): Archs | undefined => {
  if (!cpuArch) {
    return undefined;
  }
  if (cpuArch === x86 || cpuArch === arm) {
    return cpuArch;
  }
  throw new Error('Invalid cpu arch ' + cpuArch);
};

const transformClusterFixture = (fixtureMapping) => {
  const { clusters: clusterFixtures, hosts: hostsFixtures } = fixtureMapping;
  const baseCluster =
    clusterFixtures[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping.clusters['default'];
  baseCluster.platform.type = Cypress.env('AI_INTEGRATED_PLATFORM') || 'baremetal';

  const hosts = hostsFixtures
    ? hostsFixtures[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping.hosts['default']
    : fixtures.getUpdatedHosts();
  return { ...baseCluster, hosts };
};

const transformInfraEnvFixture = (fixtureMapping) => {
  return fixtureMapping[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping['default'];
};

const getScenarioFixtureMapping = () => {
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
    default:
      break;
  }
  return fixtureMapping;
};

const mockClusterResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  if (fixtureMapping?.clusters) {
    req.reply(transformClusterFixture(fixtureMapping));
  } else {
    throw new Error(
      'Incorrect fixture mapping for scenario ' + ((Cypress.env('AI_SCENARIO') as string) || ''),
    );
  }
};

const mockClusterErrorResponse: HttpRequestInterceptor = (req) => {
  req.reply({
    statusCode: 400,
    body: {
      code: '400',
      href: '',
      id: 400,
      kind: 'Error',
      reason: 'This is an error response',
    },
  });
};

const mockSupportedPlatformsResponse: HttpRequestInterceptor = (req) => {
  const platforms = Cypress.env('AI_SUPPORTED_PLATFORMS') || ['none'];
  req.reply(platforms);
};

const mockInfraEnvResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  if (fixtureMapping?.infraEnvs) {
    req.reply(transformInfraEnvFixture(fixtureMapping.infraEnvs));
  } else {
    req.reply(fixtures.baseInfraEnv);
  }
};

const mockCustomManifestResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  req.reply(fixtureMapping?.manifests || []);
};

const mockCustomManifestFileResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  const sendContent = hasWizardSignal('CUSTOM_MANIFEST_ADDED');
  req.reply(sendContent ? fixtureMapping.manifestContent : '');
};

const setScenarioEnvVars = (activeScenario) => {
  Cypress.env('AI_SCENARIO', activeScenario);
  Cypress.env('ASSISTED_SNO_DEPLOYMENT', false);
  Cypress.env('NUM_MASTERS', 3);
  Cypress.env('NUM_WORKERS', 0);

  switch (activeScenario) {
    case 'AI_CREATE_SNO':
      Cypress.env('ASSISTED_SNO_DEPLOYMENT', true);
      Cypress.env('CLUSTER_NAME', 'ai-e2e-sno');
      Cypress.env('NUM_MASTERS', 1);
      break;
    case 'AI_CREATE_MULTINODE':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-multinode');
      break;
    case 'AI_CREATE_DUALSTACK':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-dualstack');
      break;
    case 'AI_READONLY_CLUSTER':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-readonly');
      break;
    case 'AI_STORAGE_CLUSTER':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-storage');
      Cypress.env('NUM_MASTERS', 3);
      Cypress.env('NUM_WORKERS', 2);
      break;
    case 'AI_DISK_HOLDERS_CLUSTER':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-disk-holders');
      Cypress.env('NUM_MASTERS', 3);
      Cypress.env('NUM_WORKERS', 2);
      break;
    case 'AI_CREATE_STATIC_IP':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-static-ip');
      break;
    case 'AI_CREATE_CUSTOM_MANIFESTS':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-custom-manifests');
      break;
    default:
      break;
  }
};

const addClusterCreationIntercepts = () => {
  cy.intercept('POST', allClustersApiPath, mockClusterResponse).as('create-cluster');
};

const addClusterListIntercepts = () => {
  cy.intercept('GET', allClustersApiPath, (req) => {
    const { initialClusterList, updatedClusterList } = fixtures;
    const fixture = hasWizardSignal('CLUSTER_CREATED') ? updatedClusterList() : initialClusterList;
    req.reply(fixture);
  });
};

const addClusterPatchAndDetailsIntercepts = () => {
  const clusterApiPath = getDay1ClusterApiPath();
  cy.intercept('GET', clusterApiPath, mockClusterResponse).as('cluster-details');

  cy.intercept('PATCH', clusterApiPath, (req) => {
    if (Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH') === true) {
      throw new Error(`Forbidden patch: ${req.url} \n${JSON.stringify(req.body)}`);
    }

    req.alias = 'update-cluster';
    if (Cypress.env('AI_ERROR_CLUSTER_PATCH') === true) {
      mockClusterErrorResponse(req);
    } else {
      mockClusterResponse(req);
    }
  });
};

const addDay1InfraEnvIntercepts = () => {
  const infraEnvApiPath = getDay1InfraEnvApiPath();
  // Actions on particular infraEnv
  cy.intercept('GET', infraEnvApiPath, mockInfraEnvResponse).as('infra-env-details');

  cy.intercept('GET', `${infraEnvApiPath}/downloads/image-url`, fixtures.imageDownload).as(
    'download-iso-image',
  );

  // Actions on all the infraEnvs
  cy.intercept('PATCH', infraEnvApiPath, mockInfraEnvResponse).as('update-infra-env');

  cy.intercept('GET', `${allInfraEnvsApiPath}?cluster_id=${Cypress.env('clusterId')}`, [
    fixtures.baseInfraEnv,
  ]).as('filter-infra-envs');

  cy.intercept('POST', allInfraEnvsApiPath, mockInfraEnvResponse).as('create-infra-env');
};

const getDay2InfraEnvByCpuArch = (req) => {
  let infraEnv;
  if (req.url === getDay2InfraEnvApiPath(arm)) {
    infraEnv = getDay2InfraEnv(arm);
  } else {
    infraEnv = getDay2InfraEnv(x86);
  }
  req.reply(infraEnv);
};

const addDay2ClusterIntercepts = () => {
  const day1ClusterApiPath = getDay1ClusterApiPath();
  const day2ClusterApiPath = getDay2ClusterApiPath();

  cy.intercept(
    'GET',
    `${allClustersApiPath}?openshift_cluster_id=${day2FlowIds.day1.aiClusterId}`,
    (req) => {
      const fixture = hasWizardSignal('CREATED_DAY2_CLUSTER') ? [fixtures.day2AiCluster] : [];
      req.reply(fixture);
    },
  ).as('find-associated-day2-cluster');

  cy.intercept('POST', `${allClustersApiPath}/import`, (req) => {
    expect(req.body).to.include({
      openshift_cluster_id: day2FlowIds.day1.aiClusterId,
      openshift_version: '4.12',
      name: 'scale-up-day2-flow',
      api_vip_dnsname: 'console-openshift-console.apps.day2-flow.redhat.com',
    });
    req.reply({ body: fixtures.day2AiCluster, delay: 1200 }); // add some delay
  }).as('create-day2-cluster');

  cy.intercept('GET', day1ClusterApiPath, (req) => {
    req.reply(fixtures.day1OcmSubscription);
  }).as('cluster-details');

  cy.intercept('GET', day2ClusterApiPath, (req) => {
    req.reply(fixtures.day2AiCluster);
  }).as('day2-cluster-details');
};

const addDay2InfraEnvIntercepts = () => {
  // Actions on an individual infraEnv (for Day2 cluster, they are associated to a particular cpu_architecture)
  const day1InfraEnvApiPath = getDay1InfraEnvApiPath();
  cy.intercept('GET', day1InfraEnvApiPath, fixtures.day1InfraEnv).as('day1-infra-env-details');
  cy.intercept('GET', day2InfraEnvDetailsUrl, getDay2InfraEnvByCpuArch).as(
    'day2-infra-env-details',
  );
  cy.intercept('PATCH', day2InfraEnvDetailsUrl, getDay2InfraEnvByCpuArch).as(
    'update-day2-infra-env',
  );

  // Actions on all the infraEnvs
  cy.intercept('GET', `${allInfraEnvsApiPath}?cluster_id=*`, (req) => {
    const clusterId = req.query.cluster_id as string;
    let infraEnvs = [];

    if (clusterId === day2FlowIds.day1.ocmClusterId) {
      // The Day1 cluster has a single infraEnv
      infraEnvs = [fixtures.day1InfraEnv];
    } else {
      // The Day2 cluster can have more than 1 infraEnvs, each for a different CPU architecture
      const cpuArchitecture = getCpuArchitectureParam(req.query.cpu_architecture as string);
      const x86InfraEnv = getDay2InfraEnv(x86);
      const armInfraEnv = getDay2InfraEnv(arm);
      if (hasWizardSignal('ADDED_SECOND_CPU_ARCHITECTURE')) {
        if (cpuArchitecture) {
          infraEnvs = [getDay2InfraEnv(cpuArchitecture)]; // We're filtering the infraEnvs by cpuArchitecture
        } else {
          infraEnvs = [x86InfraEnv, armInfraEnv]; // We're looking for all the existing infraEnvs
        }
      } else if (hasWizardSignal('CREATED_DAY2_CLUSTER')) {
        infraEnvs = [x86InfraEnv]; // This simulates the first time the tab is accessed, where only the first infraEnv is created
      }
    }
    req.reply(infraEnvs);
  }).as('find-day2-flow-infra-envs');

  cy.intercept('POST', `${allInfraEnvsApiPath}`, (req) => {
    expect(req.body).to.include({
      cluster_id: day2FlowIds.day2.aiClusterId,
      openshift_version: '4.12',
    });
    // TODO can be empty¿?¿¿
    const cpuArch = getCpuArchitectureParam(req.body.cpu_architecture as string);
    req.reply(getDay2InfraEnv(cpuArch));
  }).as('create-day2-infra-env');
};

const addDay1HostIntercepts = () => {
  const infraEnvApiPath = getDay1InfraEnvApiPath();
  cy.intercept('PATCH', `${infraEnvApiPath}/hosts/**`, (req) => {
    const patchedHostId = req.url.match(/\/hosts\/(.+)$/)[1];
    const { hostIds, getUpdatedHosts } = fixtures;
    const index = hostIds.findIndex((hostId) => hostId === patchedHostId);
    if (req.body.host_name) {
      req.alias = `rename-host-${index + 1}`;
    }

    const hostsFixture = getUpdatedHosts();
    req.reply(hostsFixture[index]);
  });
};

const addCustomManifestsIntercepts = () => {
  cy.intercept('GET', `${allClustersApiPath}/*/manifests`, []).as('day2-flow-list-manifests');

  const day1ManifestsPath = `${allClustersApiPath}${Cypress.env('clusterId')}/manifests`;
  cy.intercept('GET', day1ManifestsPath, mockCustomManifestResponse).as('list-manifests');

  cy.intercept('PATCH', day1ManifestsPath, mockCustomManifestResponse).as('update-manifests');

  cy.intercept('POST', day1ManifestsPath, mockCustomManifestResponse).as('create-manifest');

  cy.intercept('DELETE', `${day1ManifestsPath}?folder=manifests&file_name=*`, {
    statusCode: 200,
    body: {},
  }).as('delete-manifests');

  cy.intercept(
    'GET',
    `${day1ManifestsPath}/files?folder=manifests&file_name=*`,
    mockCustomManifestFileResponse,
  ).as('info-manifest-with-content');
};

const addPlatformFeatureIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/openshift-versions', fixtures.openShiftVersions);

  cy.intercept('GET', `/api/assisted-install/v2/support-levels/features*`, (req) => {
    // This request can also have cpu_architecture in the query, for now we always assume x86_64
    const openshiftVersion = (req.query.openshift_version as string) || '';
    const cpuArchitecture = (req.query.cpu_architecture as string) || 'x86_64';
    const shortOpenshiftVersion = openshiftVersion.split('.').slice(0, 2).join('.');
    if (cpuArchitecture === 's390x') {
      req.reply(
        fixtures.featureSupportLevels[shortOpenshiftVersion.concat('_').concat(cpuArchitecture)],
      );
    } else {
      req.reply(fixtures.featureSupportLevels[shortOpenshiftVersion]);
    }
  }).as('feature-support-levels');

  // Calls that are requested for a particular cluster, the same response is returned for all clusters
  cy.intercept(
    'GET',
    `${allClustersApiPath}/*/supported-platforms`,
    mockSupportedPlatformsResponse,
  ).as('supported-platforms');
};

const addAdditionalIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/domains', [
    { domain: 'e2e.redhat.com', provider: 'route53' },
  ]);

  cy.intercept('GET', '/api/assisted-install/v2/**/default-config', fixtures.defaultConfig).as(
    'get-default-config',
  );

  cy.intercept('POST', '/api/accounts_mgmt/v1/access_token', (req) => {
    req.reply(fixtures.pullSecret);
  });
};

const addEventsIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/events*', (req) => {
    expect(req.query['order']).eq('descending');
    expect(req.query['cluster_id']).eq(Cypress.env('clusterId'));

    const events = fixtures.getEvents({
      limit: req.query['limit'],
      offset: req.query['offset'],
      severities: req.query['severities'] as string,
      hostIds: req.query['host_ids'] as string,
      clusterLevel: !!req.query['cluster_level'],
      message: req.query['message'] as string,
    });

    req.reply({
      body: events,
      headers: fixtures.getEventHeaders(req.query),
    });
  }).as('events');
};

const setEntityIds = (activeScenario: string) => {
  let clusterId;
  let infraEnvId;
  if (activeScenario === 'DAY2_FLOW') {
    clusterId = day2FlowIds.day1.aiClusterId;
    infraEnvId = day2FlowIds.day1.infraEnvId;
  } else {
    clusterId = fixtures.fakeClusterId;
    infraEnvId = fixtures.fakeClusterInfraEnvId;
  }

  Cypress.env('clusterId', clusterId);
  Cypress.env('infraEnvId', infraEnvId);
};

const loadCommonIntercepts = () => {
  addPlatformFeatureIntercepts();
  addAdditionalIntercepts();
  addCustomManifestsIntercepts();
};

const loadDay1Intercepts = () => {
  addClusterCreationIntercepts();
  addClusterListIntercepts();
  addClusterPatchAndDetailsIntercepts();
  addDay1InfraEnvIntercepts();
  addDay1HostIntercepts();
  addEventsIntercepts();
};

const loadDay2Intercepts = () => {
  addDay2ClusterIntercepts();
  addDay2InfraEnvIntercepts();
};

const loadAiAPIIntercepts = () => {
  loadCommonIntercepts();
  if (Cypress.env('AI_SCENARIO') === 'DAY2_FLOW') {
    loadDay2Intercepts();
  } else {
    loadDay1Intercepts();
  }
};

const setTestEnvironment = ({ activeSignal, activeScenario }) => {
  setLastWizardSignal(activeSignal);
  setScenarioEnvVars(activeScenario);
  setEntityIds(activeScenario);

  loadAiAPIIntercepts();
};

Cypress.Commands.add('setTestEnvironment', setTestEnvironment);
