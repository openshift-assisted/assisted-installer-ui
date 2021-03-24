import React from 'react';
import { RoleDropdown } from './RoleDropdown';
import { Host } from '../../api/types';

type RoleCellProps = {
  host: Host;
  role: string;
  readonly?: boolean;
  testId?: string;
};

const RoleCell: React.FC<RoleCellProps> = ({
  host,
  role,
  readonly = false,
  testId = 'host-role',
}) => {
  return !readonly ? (
    <RoleDropdown testId={testId} host={host} />
  ) : (
    <span data-testid={testId}>{role}</span>
  );
};

export default RoleCell;
