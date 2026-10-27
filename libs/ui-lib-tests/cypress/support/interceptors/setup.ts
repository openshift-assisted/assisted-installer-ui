import { setLastWizardSignal } from '../utils';
import * as fixtures from '../../fixtures';
import { addAdditionalIntercepts } from './additional';
import {
  addClusterCreationIntercepts,
  addClusterListIntercepts,
  addClusterPatchAndDetailsIntercepts,
  addPreflightRequirementsIntercepts,
} from './clusters';
import { addDay2ClusterIntercepts, addDay2InfraEnvIntercepts } from './day2';
import { addEventsIntercepts } from './events';
import { addDay1HostIntercepts } from './hosts';
import { addDay1InfraEnvIntercepts } from './infra-envs';
import { addCustomManifestsIntercepts } from './manifests';
import { addOperatorsIntercepts } from './operators';
import { addPlatformFeatureIntercepts } from './platform';

const { day2FlowIds } = fixtures;

const setScenarioEnvVars = (activeScenario) => {
  Cypress.expose('AI_SCENARIO', activeScenario);
  Cypress.expose('ASSISTED_SNO_DEPLOYMENT', false);
  Cypress.expose('NUM_MASTERS', 3);
  Cypress.expose('NUM_WORKERS', 0);

  switch (activeScenario) {
    case 'AI_CREATE_SNO':
      Cypress.expose('ASSISTED_SNO_DEPLOYMENT', true);
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-sno');
      Cypress.expose('NUM_MASTERS', 1);
      break;
    case 'AI_CREATE_MULTINODE':
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-multinode');
      break;
    case 'AI_CREATE_DUALSTACK':
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-dualstack');
      break;
    case 'AI_READONLY_CLUSTER':
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-readonly');
      break;
    case 'AI_STORAGE_CLUSTER':
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-storage');
      Cypress.expose('NUM_MASTERS', 3);
      Cypress.expose('NUM_WORKERS', 2);
      break;
    case 'AI_DISK_HOLDERS_CLUSTER':
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-disk-holders');
      Cypress.expose('NUM_MASTERS', 3);
      Cypress.expose('NUM_WORKERS', 2);
      break;
    case 'AI_CREATE_STATIC_IP':
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-static-ip');
      break;
    case 'AI_CREATE_CUSTOM_MANIFESTS':
      Cypress.expose('CLUSTER_NAME', 'ai-e2e-custom-manifests');
      break;
    case 'AI_OVE_CREATE_MULTINODE':
      Cypress.expose('CLUSTER_NAME', 'ai-ove-mno');
      break;
    default:
      break;
  }
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

  Cypress.expose('clusterId', clusterId);
  Cypress.expose('infraEnvId', infraEnvId);
};

const loadCommonIntercepts = () => {
  addPlatformFeatureIntercepts();
  addAdditionalIntercepts();
  addOperatorsIntercepts();
  addCustomManifestsIntercepts();
};

const loadDay1Intercepts = () => {
  addClusterCreationIntercepts();
  addClusterListIntercepts();
  addClusterPatchAndDetailsIntercepts();
  addDay1InfraEnvIntercepts();
  addDay1HostIntercepts();
  addEventsIntercepts();
  addPreflightRequirementsIntercepts();
};

const loadDay2Intercepts = () => {
  addDay2ClusterIntercepts();
  addDay2InfraEnvIntercepts();
};

const loadAiAPIIntercepts = () => {
  loadCommonIntercepts();
  if (Cypress.expose('AI_SCENARIO') === 'DAY2_FLOW') {
    loadDay2Intercepts();
  } else {
    loadDay1Intercepts();
  }
};

const setTestEnvironment = ({ activeSignal, activeScenario, singleCluster = false }) => {
  Cypress.expose('AI_SINGLE_CLUSTER', singleCluster);
  setLastWizardSignal(activeSignal);
  setScenarioEnvVars(activeScenario);
  setEntityIds(activeScenario);

  loadAiAPIIntercepts();
};

Cypress.Commands.add('setTestEnvironment', setTestEnvironment);
