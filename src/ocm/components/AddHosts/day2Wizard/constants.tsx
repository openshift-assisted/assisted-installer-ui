export type Day2WizardStepsType =
  | 'cluster-details'
  | 'generate-iso'
  | 'download-iso'
  | 'static-ip-yaml-view'
  | 'static-ip-network-wide-configurations'
  | 'static-ip-host-configurations';

export const day2WizardStepNames: { [key in Day2WizardStepsType]: string } = {
  'cluster-details': 'Cluster details',
  'generate-iso': 'Generate discovery ISO',
  'download-iso': 'Download discovery ISO',
  'static-ip-yaml-view': 'todo',
  'static-ip-network-wide-configurations': 'todo',
  'static-ip-host-configurations': 'todo',
};

export const defaultWizardSteps: Day2WizardStepsType[] = [
  'cluster-details',
  'generate-iso',
  'download-iso',
];

export const staticIpFormViewSubSteps: Day2WizardStepsType[] = [
  'static-ip-network-wide-configurations',
  'static-ip-host-configurations',
];
