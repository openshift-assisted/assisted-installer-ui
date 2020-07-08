import React from 'react';
import { RoleDropdown } from './RoleDropdown';
import { Host, Cluster } from '../../api/types';
import { canEditRole } from './utils';

export const getHostRole = (host: Host): string =>
  `${host.role}${host.bootstrap ? ' (bootstrap)' : ''}`;

type RoleCellProps = {
  host: Host;
  clusterStatus: Cluster['status'];
};

const RoleCell: React.FC<RoleCellProps> = ({ host, clusterStatus }) => {
  return canEditRole(clusterStatus, host.status) ? (
    <RoleDropdown host={host} />
  ) : (
    <>{getHostRole(host)}</>
  );
};

export default RoleCell;
