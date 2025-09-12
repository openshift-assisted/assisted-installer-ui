import { ClusterWizardStepsType } from './wizardTransition';

export const wizardStepNames: { [key in ClusterWizardStepsType]: string } = {
  'cluster-details': 'Cluster details',
  operators: 'Operators',
  'host-discovery': 'Host discovery',
  'static-ip-yaml-view': 'Static network configurations',
  'static-ip-network-wide-configurations': 'Network-wide configurations',
  'static-ip-host-configurations': 'Host specific configurations',
  storage: 'Storage',
  networking: 'Networking',
  'custom-manifests': 'Custom manifests',
  review: 'Review and create',
  'credentials-download': 'Download credentials',
  'disconnected-review': 'Review and download ISO',
  'disconnected-basic': 'Basic information',
};

export const defaultWizardSteps: ClusterWizardStepsType[] = [
  'cluster-details',
  'operators',
  'host-discovery',
  'storage',
  'networking',
  'review',
];

export const staticIpFormViewSubSteps: ClusterWizardStepsType[] = [
  'static-ip-network-wide-configurations',
  'static-ip-host-configurations',
];
