import { Host, HostRoleUpdateParams, HostValidationId } from '../api';

export type Validation = {
  id: HostValidationId;
  status: 'success' | 'failure' | 'pending' | 'disabled' | 'error';
  message: string;
};

// "infrastructure" relates to the CIM InfraEnv flow
export type ValidationGroup = 'hardware' | 'network' | 'operators' | 'infrastructure';

export type ValidationsInfo = {
  [key in ValidationGroup]?: Validation[];
};

export type ClusterWizardStepHostStatusDeterminationObject = {
  status: Host['status'];
  validationsInfo?: Host['validationsInfo'] | ValidationsInfo;
};

export type HostRole = {
  value: HostRoleUpdateParams;
  label: string;
  description: string;
};
