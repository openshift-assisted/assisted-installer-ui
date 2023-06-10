import { hasWizardSignal, setLastWizardSignal } from './utils';
import { fakeClusterId, fakeClusterInfraEnvId } from '../fixtures/cluster/base-cluster';
import { hostIds, getUpdatedHosts } from '../fixtures/hosts';
import openShiftVersions from '../fixtures/infra-envs/openshift-versions';
import featureSupport from '../fixtures/infra-envs/feature-support';
import defaultConfig from '../fixtures/cluster/default-config';

import { initialList, updatedList } from '../fixtures/cluster-list';
import { infraEnv, imageDownload } from '../fixtures/infra-envs';

import createSnoFixtureMapping from '../fixtures/create-sno';
import createMultinodeFixtureMapping from '../fixtures/create-mn';
import createReadOnlyClusterFixtureMapping from '../fixtures/read-only';
import createStorageFixtureMapping from '../fixtures/storage';
import createDualStackFixtureMapping from '../fixtures/dualstack';
import createStaticIpFixtureMapping from '../fixtures/static-ip';
import { HttpRequestInterceptor } from 'cypress/types/net-stubbing';
import createCustomManifestsFixtureMapping from '../fixtures/custom-manifests';
import { getEventHeaders, getEvents } from '../fixtures/cluster/events';

const allInfraEnvsApiPath = '/api/assisted-install/v2/infra-envs/';
const allClustersApiPath = '/api/assisted-install/v2/clusters/';

const infraEnvApiPath = `${allInfraEnvsApiPath}${fakeClusterInfraEnvId}`;
const clusterApiPath = `${allClustersApiPath}${fakeClusterId}`;

const transformClusterFixture = (fixtureMapping) => {
  const { clusters: clusterFixtures, hosts: hostsFixtures } = fixtureMapping;
  const baseCluster =
    clusterFixtures[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping.clusters['default'];
  baseCluster.platform.type = Cypress.env('AI_INTEGRATED_PLATFORM') || 'baremetal';

  const hosts = hostsFixtures
    ? hostsFixtures[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping.hosts['default']
    : getUpdatedHosts();
  return { ...baseCluster, hosts };
};

const transformInfraEnvFixture = (fixtureMapping) => {
  return fixtureMapping[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping['default'];
};

const getScenarioFixtureMapping = () => {
  let fixtureMapping = null;
  switch (Cypress.env('AI_SCENARIO')) {
    case 'AI_CREATE_SNO':
      fixtureMapping = createSnoFixtureMapping;
      break;
    case 'AI_CREATE_MULTINODE':
      fixtureMapping = createMultinodeFixtureMapping;
      break;
    case 'AI_CREATE_DUALSTACK':
      fixtureMapping = createDualStackFixtureMapping;
      break;
    case 'AI_READONLY_CLUSTER':
      fixtureMapping = createReadOnlyClusterFixtureMapping;
      break;
    case 'AI_STORAGE_CLUSTER':
      fixtureMapping = createStorageFixtureMapping;
      break;
    case 'AI_CREATE_STATIC_IP':
      fixtureMapping = createStaticIpFixtureMapping;
      break;
    case 'AI_CREATE_CUSTOM_MANIFESTS':
      fixtureMapping = createCustomManifestsFixtureMapping;
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
    req.reply(infraEnv);
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

const setScenarioEnvVars = ({ activeScenario }) => {
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
      Cypress.env('NUM_WORKERS', 0);
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
    case 'AI_CREATE_STATIC_IP':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-static-ip');
      break;
    case 'AI_CREATE_CUSTOM_MANIFESTS':
      Cypress.env('CLUSTER_NAME', 'ai-e2e-custom-manifests');
      Cypress.env('NUM_WORKERS', 0);
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
    const fixture = hasWizardSignal('CLUSTER_CREATED') ? updatedList() : initialList;
    req.reply(fixture);
  }).as('list-clusters');
};

const addClusterPatchAndDetailsIntercepts = () => {
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

const addInfraEnvIntercepts = () => {
  cy.intercept('GET', `${allInfraEnvsApiPath}?cluster_id=${fakeClusterId}`, [infraEnv]).as(
    'filter-infra-envs',
  );

  cy.intercept('GET', infraEnvApiPath, mockInfraEnvResponse).as('infra-env-details');

  cy.intercept('GET', `${infraEnvApiPath}/downloads/image-url`, imageDownload).as(
    'download-iso-image',
  );

  cy.intercept('PATCH', infraEnvApiPath, mockInfraEnvResponse).as('update-infra-env');

  cy.intercept('POST', allInfraEnvsApiPath, mockInfraEnvResponse).as('create-infra-env');
};

const addHostIntercepts = () => {
  cy.intercept('PATCH', `${infraEnvApiPath}/hosts/**`, (req) => {
    const patchedHostId = req.url.match(/\/hosts\/(.+)$/)[1];
    const index = hostIds.findIndex((hostId) => hostId === patchedHostId);
    if (req.body.host_name) {
      req.alias = `rename-host-${index + 1}`;
    }

    const hostsFixture = getUpdatedHosts();
    req.reply(hostsFixture[index]);
  });
};

const addPlatformFeatureIntercepts = () => {
  cy.intercept('GET', `${clusterApiPath}/supported-platforms`, mockSupportedPlatformsResponse).as(
    'supported-platforms',
  );

  cy.intercept('GET', '/api/assisted-install/v2/openshift-versions', openShiftVersions).as(
    'get-openshift-versions',
  );

  cy.intercept(
    'GET',
    `/api/assisted-install/v2/support-levels/features?openshift_version=**`,
    (req) => {
      const openshiftVersion = req.url.match(/openshift_version=([^&]+)/)[1];
      const shortOpenshiftVersion = openshiftVersion.split('.').slice(0, 2).join('.');
      req.reply(featureSupport[shortOpenshiftVersion]);
    },
  ).as('get-support-levels');

  cy.intercept('GET', `${clusterApiPath}/manifests`, []).as('get-cluster-manifets');
};

const addAdditionalIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/domains', [
    { domain: 'e2e.redhat.com', provider: 'route53' },
  ]).as('get-domains');

  cy.intercept('GET', '/api/assisted-install/v2/clusters/default-config', defaultConfig).as(
    'get-default-config',
  );
  cy.intercept('GET', '/api/assisted-install/v2/default-config', defaultConfig).as(
    'get-default-config',
  );
};

const addCustomManifestsIntercepts = () => {
  cy.intercept('GET', `${clusterApiPath}/manifests`, mockCustomManifestResponse).as(
    'list-manifests',
  );
  cy.intercept('PATCH', `${clusterApiPath}/manifests`, mockCustomManifestResponse).as(
    'update-manifests',
  );

  cy.intercept('POST', `${clusterApiPath}/manifests`, mockCustomManifestResponse).as(
    'create-manifest',
  );

  cy.intercept('DELETE', `${clusterApiPath}/manifests?folder=manifests&file_name=*`, {
    statusCode: 200,
    body: {},
  }).as('delete-manifests');

  cy.intercept(
    'GET',
    `${clusterApiPath}/manifests/files?folder=manifests&file_name=*`,
    mockCustomManifestFileResponse,
  ).as('info-manifest-with-content');
};

const addEventsIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/events*', (req) => {
    expect(req.query['order']).eq('descending');
    expect(req.query['cluster_id']).eq(Cypress.env('clusterId'));

    const events = getEvents({
      limit: req.query['limit'],
      offset: req.query['offset'],
      severities: req.query['severities'] as string,
      hostIds: req.query['host_ids'] as string,
      clusterLevel: !!req.query['cluster_level'],
      message: req.query['message'] as string,
    });

    req.reply({
      body: events,
      headers: getEventHeaders(req.query),
    });
  }).as('events');
};

const loadAiAPIIntercepts = (conf: AIInterceptsConfig | null) => {
  Cypress.env('clusterId', fakeClusterId);

  if (conf !== null) {
    setLastWizardSignal(conf.activeSignal);
    if (conf.activeScenario) {
      setScenarioEnvVars(conf);
    }
  }
  addCustomManifestsIntercepts();
  addClusterCreationIntercepts();
  addClusterListIntercepts();
  addClusterPatchAndDetailsIntercepts();
  addInfraEnvIntercepts();
  addHostIntercepts();
  addPlatformFeatureIntercepts();
  addAdditionalIntercepts();
  addEventsIntercepts();
};

Cypress.Commands.add('loadAiAPIIntercepts', loadAiAPIIntercepts);
