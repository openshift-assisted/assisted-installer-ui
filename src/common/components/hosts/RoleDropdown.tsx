import React from 'react';
import { HOST_ROLES } from '../../config/constants';
import { Host } from '../../api';
import { SimpleDropdown } from '../ui';
import { useStateSafely } from '../../hooks';

type RoleDropdownProps = {
  host: Host;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole: (role?: string) => Promise<any>;
  current: string;
};

const RoleDropdown: React.FC<RoleDropdownProps> = ({ host, onEditRole, current }) => {
  const [isDisabled, setDisabled] = useStateSafely(false);
  const setRole = async (role?: string) => {
    setDisabled(true);
    try {
      await onEditRole(role);
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
    />
  );
};

export default RoleDropdown;
