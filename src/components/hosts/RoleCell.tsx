import React from 'react';
import { RoleDropdown } from './RoleDropdown';
import { Host } from '../../api/types';

type RoleCellProps = {
  host: Host;
  role: string;
  readonly?: boolean;
};

const RoleCell: React.FC<RoleCellProps> = ({ host, role, readonly = false }) =>
  !readonly ? <RoleDropdown host={host} /> : <>{role}</>;

export default RoleCell;
