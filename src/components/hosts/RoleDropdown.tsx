import React from 'react';
import { useDispatch } from 'react-redux';
import { Host, ClusterUpdateParams } from '../../api/types';
import { SimpleDropdown } from '../ui/SimpleDropdown';
import { patchCluster } from '../../api/clusters';
import { Role, HOST_ROLES } from '../../config/constants';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { handleApiError } from '../../api/utils';

type RoleDropdownProps = {
  host: Host;
};

export const RoleDropdown: React.FC<RoleDropdownProps> = ({ host }) => {
  const { role, id, clusterId } = host;
  const [isDisabled, setDisabled] = React.useState(false);
  const dispatch = useDispatch();

  const setRole = async (role?: string) => {
    const params: ClusterUpdateParams = {};
    setDisabled(true);
    params.hostsRoles = [{ id, role: role as Role }];
    try {
      const { data } = await patchCluster(clusterId as string, params);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError(e);
    }
    setDisabled(false);
  };

  return (
    <SimpleDropdown
      current={role as string}
      values={HOST_ROLES}
      setValue={setRole}
      isDisabled={isDisabled}
    />
  );
};
