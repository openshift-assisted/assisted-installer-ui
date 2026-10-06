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
    case 'AI_OVE_CREATE_MULTINODE':
      Cypress.env('CLUSTER_NAME', 'ai-ove-mno');
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

  Cypress.env('clusterId', clusterId);
  Cypress.env('infraEnvId', infraEnvId);
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
  if (Cypress.env('AI_SCENARIO') === 'DAY2_FLOW') {
    loadDay2Intercepts();
  } else {
    loadDay1Intercepts();
  }
};

const setTestEnvironment = ({ activeSignal, activeScenario, singleCluster = false }) => {
  Cypress.env('AI_SINGLE_CLUSTER', singleCluster);
  setLastWizardSignal(activeSignal);
  setScenarioEnvVars(activeScenario);
  setEntityIds(activeScenario);

  loadAiAPIIntercepts();
};

Cypress.Commands.add('setTestEnvironment', setTestEnvironment);
