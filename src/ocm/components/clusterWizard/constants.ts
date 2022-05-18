import { ClusterWizardStepsType } from './wizardTransition';

export const wizardStepNames: { [key in ClusterWizardStepsType]: string } = {
  'cluster-details': 'Cluster details',
  'host-discovery': 'Host discovery',
  'static-ip-yaml-view': 'Static network configurations',
  'static-ip-network-wide-configurations': 'Network-wide configurations',
  'static-ip-host-configurations': 'Host specific configurations',
  networking: 'Networking',
  review: 'Review and create',
};

export const defaultWizardSteps: ClusterWizardStepsType[] = [
  'cluster-details',
  'host-discovery',
  'networking',
  'review',
];

export const staticIpFormViewSubSteps: ClusterWizardStepsType[] = [
  'static-ip-network-wide-configurations',
  'static-ip-host-configurations',
];
