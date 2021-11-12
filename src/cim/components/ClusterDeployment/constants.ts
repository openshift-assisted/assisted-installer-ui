import { CLUSTER_FIELD_LABELS } from '../../../common';
import { ClusterDeploymentWizardStepsType } from './types';

export const CLUSTER_HOSTS_SELECTION_LABELS: { [key in string]: string } = {
  hostCount: 'Host Count',
  masterLabels: 'Host Labels', // used in both masters-only and "auto-select masters" contexts
  workerLabels: 'Worker Hosts Labels',
};

export const CLUSTER_DEPLOYMENT_FIELD_LABELS: { [key in string]: string } = {
  ...CLUSTER_FIELD_LABELS,
  ...CLUSTER_HOSTS_SELECTION_LABELS,
};

export const wizardStepNames: {
  [key in ClusterDeploymentWizardStepsType]: string;
} = {
  'cluster-details': 'Cluster details',
  'hosts-selection': 'Cluster hosts',
  'hosts-discovery': 'Cluster hosts',
  networking: 'Installation details',
};

// TODO(mlibra): what is the limit???
export const HOSTS_MAX_COUNT = 1024;
export const HOSTS_MIN_COUNT = 3;
