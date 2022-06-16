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
  schedulableMasters: boolean;
};

const RoleCell = ({
  host,
  role,
  readonly = false,
  schedulableMasters,
  onEditRole,
  position,
}: RoleCellProps) =>
  !readonly && onEditRole ? (
    <RoleDropdown
      schedulableMasters={schedulableMasters}
      host={host}
      onEditRole={onEditRole}
      current={role}
      position={position}
    />
  ) : (
    <span>{role}</span>
  );

export default RoleCell;
