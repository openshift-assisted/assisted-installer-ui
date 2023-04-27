import { ClusterDeploymentWizardStepsType } from './types';
import { TFunction } from 'i18next';

export const clusterHostsSelectionLabel = (t: TFunction): { [key in string]: string } => ({
  hostCount: t('ai:Host Count'),
  masterLabels: t('ai:Host Labels'), // used in both masters-only and "auto-select masters" contexts
  workerLabels: t('ai:Worker Hosts Labels'),
});

export const wizardStepNames = (
  t: TFunction,
): {
  [key in ClusterDeploymentWizardStepsType]: string;
} => ({
  'cluster-details': t('ai:Cluster details'),
  'hosts-selection': t('ai:Cluster hosts'),
  'hosts-discovery': t('ai:Cluster hosts'),
  networking: t('ai:Networking'),
  review: t('ai:Review and create'),
});

// TODO(mlibra): what is the limit???
export const HOSTS_MAX_COUNT = 1024;
export const HOSTS_MIN_COUNT = 3;
