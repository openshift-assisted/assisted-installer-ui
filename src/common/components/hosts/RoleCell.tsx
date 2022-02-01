import { Tooltip } from '@patternfly/react-core';
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
};

const RoleCell: React.FC<RoleCellProps> = ({
  host,
  role,
  readonly = false,
  onEditRole,
  displayTooltip,
}) =>
  !readonly && onEditRole ? (
    <RoleDropdown host={host} onEditRole={onEditRole} current={role} />
  ) : displayTooltip ? (
    <Tooltip content={'To make the role editable, 4 or more hosts need to be discovered.'}>
      <span>{role}</span>
    </Tooltip>
  ) : (
    <span>{role}</span>
  );

export default RoleCell;
