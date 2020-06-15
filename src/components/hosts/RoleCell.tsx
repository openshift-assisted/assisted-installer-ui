import React from 'react';
import { RoleDropdown } from './RoleDropdown';
import { Host } from '../../api/types';
import { canEditRole } from './utils';

export const getHostRole = (host: Host): string =>
  `${host.role}${host.bootstrap ? ' (bootstrap)' : ''}`;

type RoleCellProps = {
  host: Host;
};

const RoleCell: React.FC<RoleCellProps> = ({ host }) => {
  return canEditRole(host.status) ? <RoleDropdown host={host} /> : <>{getHostRole(host)}</>;
};

export default RoleCell;
