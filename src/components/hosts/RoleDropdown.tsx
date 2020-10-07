import React from 'react';
import { useDispatch } from 'react-redux';
import { Host, ClusterUpdateParams, HostRoleUpdateParams } from '../../api/types';
import { SimpleDropdown } from '../ui/SimpleDropdown';
import { patchCluster } from '../../api/clusters';
import { HOST_ROLES } from '../../config/constants';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { AlertsContext } from '../AlertsContextProvider';
import { getHostRole } from './utils';

type RoleDropdownProps = {
  host: Host;
};

export const RoleDropdown: React.FC<RoleDropdownProps> = ({ host }) => {
  const { id, clusterId } = host;
  const [isDisabled, setDisabled] = React.useState(false);
  const dispatch = useDispatch();
  const { addAlert } = React.useContext(AlertsContext);

  const setRole = async (role?: string) => {
    const params: ClusterUpdateParams = {};
    setDisabled(true);
    params.hostsRoles = [{ id, role: role as HostRoleUpdateParams }];
    try {
      const { data } = await patchCluster(clusterId as string, params);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to set role', message: getErrorMessage(e) }),
      );
    }
    setDisabled(false);
  };

  return (
    <SimpleDropdown
      defaultValue={HOST_ROLES[0].value}
      current={getHostRole(host)}
      items={HOST_ROLES}
      setValue={setRole}
      isDisabled={isDisabled}
    />
  );
};
