import { HostRoleUpdateParams, HostValidationId } from '../api/types';

export type Validation = {
  id: HostValidationId;
  status: 'success' | 'failure' | 'pending';
  message: string;
};

export type ValidationsInfo = {
  hardware?: Validation[];
  network?: Validation[];
  role?: Validation[];
};

export type HostRole = {
  value: HostRoleUpdateParams;
  label: string;
  description: string;
};
