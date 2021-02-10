import { HostRoleUpdateParams, HostValidationId } from '../api/types';

export type Validation = {
  id: HostValidationId;
  status: 'success' | 'failure' | 'pending';
  message: string;
};

export type ValidationGroup = 'hardware' | 'network' | 'role';

export type ValidationsInfo = {
  [key in ValidationGroup]?: Validation[];
};

export type HostRole = {
  value: HostRoleUpdateParams;
  label: string;
  description: string;
};
