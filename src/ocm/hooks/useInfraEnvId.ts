import React from 'react';
import { Cluster, CpuArchitecture, InfraEnv } from '../../common';
import { getErrorMessage } from '../../common/utils';
import { InfraEnvsService } from '../services';

export default function useInfraEnvId(clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture) {
  const [infraEnvId, setInfraEnv] = React.useState<InfraEnv['id']>();
  const [error, setError] = React.useState('');

  const findInfraEnvId = React.useCallback(async () => {
    try {
      const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId, cpuArchitecture);
      setInfraEnv(infraEnvId);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [clusterId, cpuArchitecture]);

  React.useEffect(() => {
    if (clusterId && !infraEnvId) {
      void findInfraEnvId();
    }
  }, [clusterId, findInfraEnvId, infraEnvId]);

  return { infraEnvId, error };
}
