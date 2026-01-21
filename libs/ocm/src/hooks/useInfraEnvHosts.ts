import React from 'react';
import useInfraEnvId from './useInfraEnvId';
import { CpuArchitecture, DEFAULT_POLLING_INTERVAL } from '@openshift-assisted/common';
import { getErrorMessage } from '@openshift-assisted/common/utils';
import { InfraEnvsAPI } from '../services/apis';
import InfraEnvIdsCacheService from '../services/InfraEnvIdsCacheService';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';

const useInfraEnvHosts = (
  clusterId: Cluster['id'],
  cpuArchitecture: CpuArchitecture,
  clusterName?: string,
  pullSecret?: string,
  openshiftVersion?: string,
) => {
  const [hosts, setHosts] = React.useState<Host[]>();
  const [error, setError] = React.useState('');
  const { infraEnvId, error: infraEnvIdError } = useInfraEnvId(
    clusterId,
    cpuArchitecture,
    clusterName,
    pullSecret,
    openshiftVersion,
  );

  const getHosts = React.useCallback(async () => {
    try {
      if (infraEnvId) {
        const { data: hostsData } = await InfraEnvsAPI.getHosts(infraEnvId);
        setHosts(hostsData);
      }
    } catch (e) {
      // Invalidate this cluster's cached data
      InfraEnvIdsCacheService.removeInfraEnvId(clusterId, cpuArchitecture);
      setError(getErrorMessage(e));
    }
  }, [clusterId, cpuArchitecture, infraEnvId]);

  React.useEffect(() => {
    if (infraEnvIdError) {
      setHosts(undefined);
      setError(infraEnvIdError);
    } else {
      if (infraEnvId) {
        // Initial fetch
        void getHosts();

        // Set up polling to refetch hosts periodically
        const intervalId = setInterval(() => {
          void getHosts();
        }, DEFAULT_POLLING_INTERVAL);

        return () => clearInterval(intervalId);
      }
    }
  }, [getHosts, infraEnvId, infraEnvIdError]);

  return { hosts, error, isLoading: !hosts && !error };
};
export default useInfraEnvHosts;
