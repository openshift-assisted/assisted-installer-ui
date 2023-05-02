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

const allInfraEnvsApiPath = '/api/assisted-install/v2/infra-envs/';
const allClustersApiPath = '/api/assisted-install/v2/clusters/';

const infraEnvApiPath = `${allInfraEnvsApiPath}${fakeClusterInfraEnvId}`;
const clusterApiPath = `${allClustersApiPath}${fakeClusterId}`;

const transformClusterFixture = (fixtureMapping) => {
  const { clusters: clusterFixtures, hosts: hostsFixtures  } = fixtureMapping;
  const baseCluster = clusterFixtures[Cypress.env('AI_LAST_SIGNAL')] || fixtureMapping.clusters['default'];
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
    default:
      break;
  }
  return fixtureMapping;
};

const mockClusterResponse = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  if (fixtureMapping?.clusters) {
    req.reply(transformClusterFixture(fixtureMapping));
  } else {
    throw new Error('Incorrect fixture mapping for scenario ' + ((Cypress.env('AI_SCENARIO') as string) || ''));
  }
};

const mockSupportedPlatformsResponse = (req) => {
  const platforms = Cypress.env('AI_SUPPORTED_PLATFORMS') || ['none'];
  req.reply(platforms);
};

const mockInfraEnvResponse = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  if (fixtureMapping?.infraEnvs) {
    req.reply(transformInfraEnvFixture(fixtureMapping.infraEnvs));
  } else {
    req.reply(infraEnv);
  }
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
  });
};

const addClusterPatchAndDetailsIntercepts = () => {
  cy.intercept('GET', clusterApiPath, mockClusterResponse).as('cluster-details');

  cy.intercept('PATCH', clusterApiPath, (req) => {
    if (Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH') === true) {
      throw new Error(`Forbidden patch: ${req.url} \n${JSON.stringify(req.body)}`);
    }

    req.alias = 'update-cluster';
    mockClusterResponse(req);
  });
};

const addInfraEnvIntercepts = () => {
  cy.intercept('GET', `${allInfraEnvsApiPath}?cluster_id=${fakeClusterId}`, [infraEnv]).as('filter-infra-envs');

  cy.intercept('GET', infraEnvApiPath, mockInfraEnvResponse).as('infra-env-details');

  cy.intercept('GET', `${infraEnvApiPath}/downloads/image-url`, imageDownload).as('download-iso-image');

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

  cy.intercept('GET', '/api/assisted-install/v2/openshift-versions', openShiftVersions);

  cy.intercept('GET', '/api/assisted-install/v2/feature-support-levels', featureSupport);
};

const addAdditionalIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/domains', [{ domain: 'e2e.redhat.com', provider: 'route53' }]);

  cy.intercept('GET', '/api/assisted-install/v2/clusters//default-config', defaultConfig);
  cy.intercept('GET', '/api/assisted-install/v2/default-config', defaultConfig);
};

const loadAiAPIIntercepts = (conf) => {
  Cypress.env('clusterId', fakeClusterId);

  if (conf !== null) {
    setLastWizardSignal(conf.activeSignal);
    if (conf.activeScenario) {
      setScenarioEnvVars(conf);
    }
  }

  addClusterCreationIntercepts();
  addClusterListIntercepts();
  addClusterPatchAndDetailsIntercepts();
  addInfraEnvIntercepts();
  addHostIntercepts();
  addPlatformFeatureIntercepts();
  addAdditionalIntercepts();
};

Cypress.Commands.add('loadAiAPIIntercepts', loadAiAPIIntercepts);
