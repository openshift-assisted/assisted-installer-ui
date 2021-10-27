import React from 'react';
import { Host, HostUpdateParams } from '../../api';
import { HOST_ROLES } from '../../config';
import { SimpleDropdown } from '../ui';
import { getHostRole } from './utils';

type RoleDropdownProps = {
  host: Host;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole: (role: HostUpdateParams['hostRole']) => Promise<any>;
};

const RoleDropdown: React.FC<RoleDropdownProps> = ({ host, onEditRole }) => {
  const [isDisabled, setDisabled] = React.useState(false);

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
      current={getHostRole(host)}
      items={HOST_ROLES}
      setValue={setRole}
      isDisabled={isDisabled}
      idPrefix={`role-${host.requestedHostname}`}
    />
  );
};

export default RoleDropdown;
