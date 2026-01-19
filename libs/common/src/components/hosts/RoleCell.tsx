import React from 'react';
import { Host, HostUpdateParams } from '@openshift-assisted/types/assisted-installer-service';
import RoleDropdown from './RoleDropdown';

export type RoleCellProps = {
  host: Host;
  role: string;
  readonly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole?: (role: HostUpdateParams['hostRole']) => Promise<any>;
  displayTooltip?: boolean;
};

const RoleCell: React.FC<RoleCellProps> = ({ host, role, readonly = false, onEditRole }) =>
  !readonly && onEditRole ? (
    <RoleDropdown host={host} onEditRole={onEditRole} current={role} />
  ) : (
    <span>{role}</span>
  );

export default RoleCell;
