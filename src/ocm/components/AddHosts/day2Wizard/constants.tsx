export type Day2WizardStepsType =
  | 'cluster-details'
  | 'generate-iso'
  | 'download-iso'
  | 'static-ip-yaml-view'
  | 'static-ip-network-wide-configurations'
  | 'static-ip-host-configurations';

export const day2WizardStepNames: { [key in Day2WizardStepsType]: string } = {
  'cluster-details': 'Cluster details',
  'static-ip-yaml-view': 'Static network configurations',
  'static-ip-network-wide-configurations': 'Network-wide configurations',
  'static-ip-host-configurations': 'Host specific configurations',
  'generate-iso': 'Generate discovery ISO',
  'download-iso': 'Download discovery ISO',
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
