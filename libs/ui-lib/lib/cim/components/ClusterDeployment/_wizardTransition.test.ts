import { test, describe, expect } from 'vitest';
import cloneDeep from 'lodash-es/cloneDeep';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { AgentK8sResource } from '../../types/k8s/agent';
import {
  canNextFromHostDiscoveryStep,
  canNextFromHostSelectionStep,
  canNextFromNetworkingStep,
} from './wizardTransition';
import { ValidationGroup as ClusterValidationGroup } from '../../../common';
import { ValidationGroup as HostValidationGroup } from '../../../common/types/hosts';
import {
  ClusterValidationId,
  HostValidationId,
} from '@openshift-assisted/types/assisted-installer-service';

const agentClusterInstallBase: AgentClusterInstallK8sResource = {
  apiVersion: 'foo-apiVersion',
  kind: 'AgentClusterInstall',
  metadata: {
    name: 'test-cluster',
    clusterName: 'test-cluster',
    namespace: 'test-cluster',
  },
  spec: undefined,
  status: {},
};

const agentSpec: AgentK8sResource['spec'] = {
  approved: true,
  role: 'auto-assign',
  hostname: 'test-hostname',
};

const getAgentClusterInstall = (
  validationGroupName: ClusterValidationGroup = 'hostsData',
  clusterValidationIds: ClusterValidationId[] = [
    'sufficient-masters-count',
    'odf-requirements-satisfied',
    'lso-requirements-satisfied',
    'cnv-requirements-satisfied',
  ],
): AgentClusterInstallK8sResource => {
  const agentClusterInstall: AgentClusterInstallK8sResource = cloneDeep(agentClusterInstallBase);
  agentClusterInstall.status = {
    debugInfo: {
      state: 'insufficient',
    },
    validationsInfo: {
      [validationGroupName]: [],
    },
  };

  clusterValidationIds.forEach((clusterValidationId) => {
    agentClusterInstall.status?.validationsInfo?.[validationGroupName]?.push({
      id: clusterValidationId,
      status: 'success',
      message: 'A validation message',
    });
  });

  return agentClusterInstall;
};

const getAgents = (
  validationGroupName: HostValidationGroup = 'hardware',
  hostValidationIds: HostValidationId[] = [
    'odf-requirements-satisfied',
    'lso-requirements-satisfied',
    'cnv-requirements-satisfied',
    'connected',
  ],
): AgentK8sResource[] => {
  const agents: AgentK8sResource[] = [
    {
      spec: agentSpec,
      status: {
        inventory: {},
        debugInfo: {
          state: 'insufficient' /* or pending-for-input */,
        },
        validationsInfo: {
          [validationGroupName]: [],
        },
      },
    },
  ];

  hostValidationIds.forEach((hostValidationId) => {
    agents[0].status?.validationsInfo?.[validationGroupName]?.push({
      id: hostValidationId,
      status: 'success',
      message: 'A validation message',
    });
  });

  return agents;
};

/*
  These tests are focused not only on the hostDiscoveryStepValidationsMap but to the computation mechanics.
  If there is a bug in a way how we calculate the true/false transition, please cover it here.
 
  Various flows testing basics of the *ValidationMap configurations" is covered by a separate suite.
*/
describe('CIM wizardTransition calculation', () => {
  test('Pass for a ready cluster', () => {
    const agentClusterInstall: AgentClusterInstallK8sResource = cloneDeep(agentClusterInstallBase);
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(false);

    agentClusterInstall.status = {
      debugInfo: {
        state: 'ready',
      },
      validationsInfo: {},
    };
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(true);
  });

  test('An insufficient cluster, no agents', () => {
    const agentClusterInstall = getAgentClusterInstall();

    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(true);
    agentClusterInstall.status.validationsInfo.hostsData[3].status = 'disabled';
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(true);
    agentClusterInstall.status.validationsInfo.hostsData[3].status = 'pending';
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(false);
    agentClusterInstall.status.validationsInfo.hostsData[3].status = 'error';
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(false);
    agentClusterInstall.status.validationsInfo.hostsData[3].status = 'success';
    agentClusterInstall.status.validationsInfo?.hostsData.push({
      id: 'all-hosts-are-ready-to-install' /* Irrelevant for the wizard step */,
      status: 'error',
      message: 'A failing message',
    });
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(true) /* Still true */;
    // removing required validation
    agentClusterInstall.status.validationsInfo.hostsData.splice(1, 1);
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(false);
    // revert the change
    agentClusterInstall.status?.validationsInfo?.hostsData?.push({
      id: 'odf-requirements-satisfied',
      status: 'success',
      message: 'A validation message',
    });
    expect(canNextFromHostSelectionStep(agentClusterInstall, [])).toBe(true);
  });

  test('A ready cluster, testing agent states', () => {
    const agentClusterInstall = getAgentClusterInstall();
    const agentMissingRequiredValidations = getAgents('hardware', ['connected']);
    expect(canNextFromHostSelectionStep(agentClusterInstall, agentMissingRequiredValidations)).toBe(
      false,
    );

    const agents = getAgents();
    expect(canNextFromHostSelectionStep(agentClusterInstall, agents)).toBe(true);
    agents[0].status.validationsInfo.hardware[1].status = 'disabled';
    expect(canNextFromHostSelectionStep(agentClusterInstall, agents)).toBe(true);
    agents[0].status.validationsInfo.hardware[1].status = 'error';
    expect(canNextFromHostSelectionStep(agentClusterInstall, agents)).toBe(false);
  });

  test('A ready cluster, passing agent states, testing agent validation groups', () => {
    const agentClusterInstall = getAgentClusterInstall();
    const agents = getAgents();

    // Whole "hardware" group must be of success
    expect(canNextFromHostSelectionStep(agentClusterInstall, agents)).toBe(true);
    agents[0].status.validationsInfo.hardware[3].status = 'error';
    expect(canNextFromHostSelectionStep(agentClusterInstall, agents)).toBe(false);

    const agentsWitNonMandatoryGroup = getAgents();
    // Adding irrelevant validation to a "non-mandatory" group (the infrastructure, only the "hardware" group is mandatory for this transition)
    agentsWitNonMandatoryGroup[0].status.validationsInfo.infrastructure = [
      {
        id: 'belongs-to-machine-cidr' /* Irrelevant for the step, so should be still passing */,
        status: 'error',
        message: 'A host validation message',
      },
    ];
    expect(canNextFromHostSelectionStep(agentClusterInstall, agentsWitNonMandatoryGroup)).toBe(
      true,
    );

    const agentsWithoutHardwareGroup = getAgents('hardware', []);
    agents[0].status.validationsInfo.hardware = undefined;
    expect(canNextFromHostSelectionStep(agentClusterInstall, agentsWithoutHardwareGroup)).toBe(
      false,
    );

    const agentsWitoutAllMandatoryGroup = getAgents('network', []);
    expect(canNextFromHostSelectionStep(agentClusterInstall, agentsWitoutAllMandatoryGroup)).toBe(
      false,
    );
  });
});

describe('CIM wizardTransitions', () => {
  test('canNextFromHostSelectionStep', () => {
    // Driven by hostDiscoveryStepValidationsMap
    const agentClusterInstall = getAgentClusterInstall();
    const agents = getAgents();
    expect(canNextFromHostSelectionStep(agentClusterInstall, agents)).toBe(true);
  });

  test('canNextFromHostDiscoveryStep', () => {
    // Driven by hostDiscoveryStepValidationsMap, same as canNextFromHostSelectionStep
    const agentClusterInstall = getAgentClusterInstall();
    const agents = getAgents();
    expect(canNextFromHostDiscoveryStep(agentClusterInstall, agents)).toBe(true);
  });

  test('canNextFromNetworkingStep', () => {
    // Driven by the networkingStepValidationsMap
    const agentClusterInstallWithoutNetworkGroup = getAgentClusterInstall();
    expect(canNextFromNetworkingStep(agentClusterInstallWithoutNetworkGroup, [])).toBe(false);

    const agentClusterInstallEmptyNetworkGroup = getAgentClusterInstall('network', []);
    expect(canNextFromNetworkingStep(agentClusterInstallEmptyNetworkGroup, [])).toBe(true);

    const agentClusterInstall = getAgentClusterInstall('network', [
      // just some of them. Backend will provide a comprehensive list.
      'api-vips-defined',
      'api-vips-valid',
    ]);
    expect(canNextFromNetworkingStep(agentClusterInstall, [])).toBe(true);

    // One validation from a mandatory group is failing
    agentClusterInstall.status.validationsInfo.network[0].status = 'error';
    expect(canNextFromNetworkingStep(agentClusterInstall, [])).toBe(false);
    // Revert
    agentClusterInstall.status.validationsInfo.network[0].status = 'success';
    expect(canNextFromNetworkingStep(agentClusterInstall, [])).toBe(true);

    const agents = getAgents('network', ['ntp-synced', 'has-default-route']);
    expect(canNextFromNetworkingStep(agentClusterInstall, agents)).toBe(true);

    // The ntp-synced is set as soft-validation, so still passing
    agents[0].status.validationsInfo.network[0].status = 'error';
    expect(canNextFromNetworkingStep(agentClusterInstall, agents)).toBe(true);

    // The has-default-route is NOT set as soft-validation, so it should fail
    agents[0].status.validationsInfo.network[1].status = 'error';
    expect(canNextFromNetworkingStep(agentClusterInstall, agents)).toBe(false);
  });
});
