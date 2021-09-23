import { HostRoleUpdateParams, HostValidationId } from '../api/types';

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

export type HostRole = {
  value: HostRoleUpdateParams;
  label: string;
  description: string;
};
