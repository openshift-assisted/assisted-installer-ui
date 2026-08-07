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
  [key in ClusterDeploymentWizardStepsType | 'installation-type' | 'automation']: string;
} => ({
  'installation-type': t('ai:Installation type'),
  automation: t('ai:Automation'),
  'cluster-details': t('ai:Cluster details'),
  'host-selection': t('ai:Cluster hosts'),
  'host-discovery': t('ai:Cluster hosts'),
  networking: t('ai:Networking'),
  'custom-manifests': t('ai:Custom manifests'),
  review: t('ai:Review and create'),
});

// TODO(mlibra): what is the limit???
export const HOSTS_MAX_COUNT = 1024;
