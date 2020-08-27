import React from 'react';
import { RoleDropdown } from './RoleDropdown';
import { Host, Cluster } from '../../api/types';
import { canEditRole, getHostRole } from './utils';

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
