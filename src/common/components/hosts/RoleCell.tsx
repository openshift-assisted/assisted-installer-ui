import { DropdownProps } from '@patternfly/react-core';
import React from 'react';
import { Host, HostUpdateParams } from '../../api';
import RoleDropdown from './RoleDropdown';

export type RoleCellProps = {
  host: Host;
  role: string;
  readonly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole?: (role: HostUpdateParams['hostRole']) => Promise<any>;
  displayTooltip?: boolean;
  position?: DropdownProps['position'];
};

const RoleCell: React.FC<RoleCellProps> = ({
  host,
  role,
  readonly = false,
  onEditRole,
  position,
}) =>
  !readonly && onEditRole ? (
    <RoleDropdown host={host} onEditRole={onEditRole} current={role} position={position} />
  ) : (
    <span>{role}</span>
  );

export default RoleCell;
