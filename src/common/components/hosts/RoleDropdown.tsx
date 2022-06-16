import React from 'react';
import { HOST_ROLES } from '../../config/constants';
import { Host, HostUpdateParams } from '../../api';
import { SimpleDropdown } from '../ui';
import { useStateSafely } from '../../hooks';
import { DropdownProps } from '@patternfly/react-core';
import { HostRoleItem } from '../../types/hosts';

type RoleDropdownProps = {
  host: Host;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole: (role: HostUpdateParams['hostRole']) => Promise<any>;
  current: string;
  position?: DropdownProps['position'];
  schedulableMasters: boolean;
};

const RoleDropdown = ({
  host,
  schedulableMasters,
  onEditRole,
  current,
  position,
}: RoleDropdownProps) => {
  const [isDisabled, setDisabled] = useStateSafely(false);
  const setRole = async (role?: string) => {
    setDisabled(true);
    try {
      await onEditRole(role as HostUpdateParams['hostRole']);
    } finally {
      setDisabled(false);
    }
  };

  const roles: HostRoleItem[] = React.useMemo<HostRoleItem[]>(() => {
    return HOST_ROLES.filter((hostRole) => {
      if (schedulableMasters) {
        return ['on', 'any'].includes(hostRole.schedulable_policy);
      } else {
        return ['off', 'any'].includes(hostRole.schedulable_policy);
      }
    });
  }, [schedulableMasters]);

  return (
    <SimpleDropdown
      items={roles}
      defaultValue={roles[0].value}
      current={current}
      setValue={setRole}
      isDisabled={isDisabled}
      idPrefix={`role-${host.requestedHostname}`}
      position={position}
    />
  );
};

export default RoleDropdown;
