import React from 'react';
import { HOST_ROLES } from '../../config/constants';
import { Host, HostUpdateParams } from '../../api';
import { SimpleDropdown } from '../ui';
import { useStateSafely } from '../../hooks';
import { DropdownProps } from '@patternfly/react-core';

type RoleDropdownProps = {
  host: Host;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole: (role: HostUpdateParams['hostRole']) => Promise<any>;
  current: string;
  position?: DropdownProps['position'];
};

const RoleDropdown: React.FC<RoleDropdownProps> = ({ host, onEditRole, current, position }) => {
  const [isDisabled, setDisabled] = useStateSafely(false);
  const setRole = async (role?: string) => {
    setDisabled(true);
    try {
      await onEditRole(role as HostUpdateParams['hostRole']);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <SimpleDropdown
      defaultValue={HOST_ROLES[0].value}
      current={current}
      items={HOST_ROLES}
      setValue={setRole}
      isDisabled={isDisabled}
      idPrefix={`role-${host.requestedHostname}`}
      position={position}
    />
  );
};

export default RoleDropdown;
