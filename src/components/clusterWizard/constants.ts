import { ClusterWizardStepsType } from './wizardTransition';

export const wizardStepNames: {
  [key in ClusterWizardStepsType]: string;
} = {
  'cluster-details': 'Cluster Details',
  'host-discovery': 'Host Discovery',
  networking: 'Networking',
  review: 'Review & Create',
};
