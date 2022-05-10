import {
  getAllClusterWizardSoftValidationIds,
  getWizardStepClusterStatus,
  WizardStepsValidationMap,
  WizardStepValidationMap,
} from '../../../common/components/clusterWizard/validationsInfoUtils';
import { ClusterWizardStepHostStatusDeterminationObject } from '../../../common/types/hosts';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentWizardStepsType } from './types';

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'hosts-selection'
  | 'hosts-discovery'
  | 'networking'
  | 'review';

const clusterDetailsStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['pull-secret-set', 'dns-domain-defined'],
  },
  host: {
    allowedStatuses: [],
    groups: [],
    validationIds: [],
  },
  softValidationIds: [],
};

const hostDiscoveryStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: [
      'sufficient-masters-count',
      'odf-requirements-satisfied',
      'lso-requirements-satisfied',
      'cnv-requirements-satisfied',
    ],
  },
  host: {
    allowedStatuses: ['known', 'known-unbound', 'disabled'],
    groups: ['hardware'],
    validationIds: [
      'connected',
      'odf-requirements-satisfied',
      'lso-requirements-satisfied',
      'cnv-requirements-satisfied',
    ],
  },
  softValidationIds: [],
};

const networkingStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: ['network'],
    validationIds: [],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['network'],
    validationIds: [],
  },
  // TODO(jtomasek): container-images-available validation is currently not running on the backend, it stays in pending.
  // marking it as soft validation is the easy way to prevent it from blocking the progress.
  // Alternatively we would have to whitelist network validations instead of using group
  // TODO(mlibra): remove that container-images-available from soft validations and let backend drive it via disabling it.
  //   Depends on: https://issues.redhat.com/browse/MGMT-5265
  softValidationIds: ['ntp-synced', 'container-images-available'],
};

const reviewStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['all-hosts-are-ready-to-install'],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: [],
    validationIds: [],
  },
  softValidationIds: [],
};

export const wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType> = {
  'cluster-details': clusterDetailsStepValidationsMap,
  'hosts-discovery': hostDiscoveryStepValidationsMap,
  'hosts-selection': hostDiscoveryStepValidationsMap,
  networking: networkingStepValidationsMap,
  review: reviewStepValidationsMap,
};

export const allClusterWizardSoftValidationIds =
  getAllClusterWizardSoftValidationIds(wizardStepsValidationsMap);

const canNextFromClusterDeploymentWizardStep = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  agents: AgentK8sResource[],
  wizardStepId: ClusterDeploymentWizardStepsType,
) => {
  const clusterStatus = agentClusterInstall?.status?.debugInfo?.state;
  const validationsInfo = agentClusterInstall?.status?.validationsInfo;
  const hosts = agents.reduce<ClusterWizardStepHostStatusDeterminationObject[]>((result, agent) => {
    const status = agent.status?.debugInfo?.state;
    if (status) {
      result.push({ status, validationsInfo: agent.status?.validationsInfo });
    }
    return result;
  }, []);
  if (!clusterStatus) {
    return false;
  }
  return (
    getWizardStepClusterStatus(
      wizardStepId,
      wizardStepsValidationsMap,
      { status: clusterStatus, validationsInfo: validationsInfo || {} },
      hosts,
    ) === 'ready'
  );
};

export const canNextFromHostSelectionStep = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  agents: AgentK8sResource[],
) => canNextFromClusterDeploymentWizardStep(agentClusterInstall, agents, 'hosts-selection');

export const canNextFromHostDiscoveryStep = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  agents: AgentK8sResource[],
) => canNextFromClusterDeploymentWizardStep(agentClusterInstall, agents, 'hosts-discovery');

export const canNextFromNetworkingStep = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  agents: AgentK8sResource[],
) => canNextFromClusterDeploymentWizardStep(agentClusterInstall, agents, 'networking');

export const canNextFromReviewStep = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  agents: AgentK8sResource[],
) => canNextFromClusterDeploymentWizardStep(agentClusterInstall, agents, 'review');
